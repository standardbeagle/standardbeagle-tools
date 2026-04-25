import { readFile } from 'node:fs/promises';
import {
  PDFArray,
  PDFBool,
  PDFDict,
  PDFDocument,
  PDFHexString,
  PDFName,
  PDFString,
} from 'pdf-lib';
import {
  PdfA11yInputSchema,
  type PdfA11yOutput,
} from './pdf-a11y.schema.js';

const ZERO_RESULT_ON_PARSE_ERROR: Omit<PdfA11yOutput, 'issues'> = {
  is_tagged: false,
  has_structure_tree: false,
  image_count: 0,
  images_with_alt: 0,
  form_fields_total: 0,
  form_fields_labeled: 0,
  reading_order_defined: false,
  score: 0,
};

interface FigureCounts {
  total: number;
  withAlt: number;
}

interface FormCounts {
  total: number;
  labeled: number;
}

function readPdfText(value: unknown): string | undefined {
  if (value instanceof PDFString) return value.asString();
  if (value instanceof PDFHexString) return value.decodeText();
  return undefined;
}

function isMarked(catalog: PDFDict): boolean {
  const markInfo = catalog.lookup(PDFName.of('MarkInfo'));
  if (!(markInfo instanceof PDFDict)) return false;
  const marked = markInfo.lookup(PDFName.of('Marked'));
  if (marked instanceof PDFBool) return marked.asBoolean();
  return false;
}

function countFiguresInStructTree(node: PDFDict, counts: FigureCounts): void {
  const s = node.lookup(PDFName.of('S'));
  if (s instanceof PDFName && s.toString() === '/Figure') {
    counts.total += 1;
    const alt = node.lookup(PDFName.of('Alt'));
    if (readPdfText(alt) !== undefined) {
      counts.withAlt += 1;
    }
  }
  const k = node.lookup(PDFName.of('K'));
  if (k instanceof PDFArray) {
    for (let i = 0; i < k.size(); i++) {
      const child = k.lookup(i);
      if (child instanceof PDFDict) {
        countFiguresInStructTree(child, counts);
      }
    }
  } else if (k instanceof PDFDict) {
    countFiguresInStructTree(k, counts);
  }
}

function countFigures(catalog: PDFDict): FigureCounts {
  const counts: FigureCounts = { total: 0, withAlt: 0 };
  const str = catalog.lookup(PDFName.of('StructTreeRoot'));
  if (str instanceof PDFDict) {
    countFiguresInStructTree(str, counts);
  }
  return counts;
}

function countFormFields(catalog: PDFDict): FormCounts {
  const counts: FormCounts = { total: 0, labeled: 0 };
  const acro = catalog.lookup(PDFName.of('AcroForm'));
  if (!(acro instanceof PDFDict)) return counts;
  const fields = acro.lookup(PDFName.of('Fields'));
  if (!(fields instanceof PDFArray)) return counts;

  for (let i = 0; i < fields.size(); i++) {
    const field = fields.lookup(i);
    if (!(field instanceof PDFDict)) continue;
    counts.total += 1;
    const tu = readPdfText(field.lookup(PDFName.of('TU')));
    const t = readPdfText(field.lookup(PDFName.of('T')));
    if (tu !== undefined || t !== undefined) {
      counts.labeled += 1;
    }
  }
  return counts;
}

function readLanguage(catalog: PDFDict): string | undefined {
  return readPdfText(catalog.lookup(PDFName.of('Lang')));
}

function readTitle(doc: PDFDocument): string | undefined {
  const title = doc.getTitle();
  if (typeof title === 'string' && title.length > 0) return title;
  return undefined;
}

function computeScore(parts: {
  isTagged: boolean;
  imageCount: number;
  imagesWithAlt: number;
  hasLanguage: boolean;
  hasTitle: boolean;
  formFieldsTotal: number;
  formFieldsLabeled: number;
  readingOrderDefined: boolean;
}): number {
  let score = 0;
  if (parts.isTagged) score += 40;
  score += parts.imageCount === 0 ? 20 : (parts.imagesWithAlt / parts.imageCount) * 20;
  if (parts.hasLanguage) score += 10;
  if (parts.hasTitle) score += 10;
  score += parts.formFieldsTotal === 0
    ? 10
    : (parts.formFieldsLabeled / parts.formFieldsTotal) * 10;
  if (parts.readingOrderDefined) score += 10;
  return Math.round(score);
}

function buildIssues(parts: {
  isTagged: boolean;
  imageCount: number;
  imagesWithAlt: number;
  hasLanguage: boolean;
  hasTitle: boolean;
  formFieldsTotal: number;
  formFieldsLabeled: number;
  hasStructureTree: boolean;
}): string[] {
  const issues: string[] = [];
  if (!parts.isTagged) issues.push('not_tagged');
  if (!parts.hasStructureTree) issues.push('missing_structure_tree');
  if (parts.imageCount > 0 && parts.imagesWithAlt < parts.imageCount) {
    issues.push('image_without_alt');
  }
  if (!parts.hasLanguage) issues.push('missing_language');
  if (!parts.hasTitle) issues.push('missing_title');
  if (
    parts.formFieldsTotal > 0 &&
    parts.formFieldsLabeled < parts.formFieldsTotal
  ) {
    issues.push('form_field_unlabeled');
  }
  return issues;
}

export async function pdfA11y(input: unknown): Promise<PdfA11yOutput> {
  const { pdf_path } = PdfA11yInputSchema.parse(input);

  let bytes: Buffer;
  try {
    bytes = await readFile(pdf_path);
  } catch {
    return { ...ZERO_RESULT_ON_PARSE_ERROR, issues: ['parse_error'] };
  }

  let doc: PDFDocument;
  try {
    // ignoreEncryption keeps us robust against minor catalog quirks; we still
    // wrap in try/catch for true byte-level corruption.
    doc = await PDFDocument.load(bytes, { ignoreEncryption: true });
  } catch {
    return { ...ZERO_RESULT_ON_PARSE_ERROR, issues: ['parse_error'] };
  }

  // From here on, any unexpected dict shape gets caught and reported as
  // parse_error rather than crashing the handler.
  try {
    const catalog = doc.catalog;

    const isTagged = isMarked(catalog);
    const language = readLanguage(catalog);
    const title = readTitle(doc);
    const hasStructureTree = catalog.has(PDFName.of('StructTreeRoot'));
    const figures = countFigures(catalog);
    const formCounts = countFormFields(catalog);
    // Sibling-order verification against page content order requires content
    // stream parsing pdf-lib doesn't expose. Document the simplification:
    // we treat structure-tree presence as the operational signal.
    const readingOrderDefined = hasStructureTree;

    const scoreParts = {
      isTagged,
      imageCount: figures.total,
      imagesWithAlt: figures.withAlt,
      hasLanguage: language !== undefined,
      hasTitle: title !== undefined,
      formFieldsTotal: formCounts.total,
      formFieldsLabeled: formCounts.labeled,
      readingOrderDefined,
    };

    return {
      is_tagged: isTagged,
      language,
      title,
      has_structure_tree: hasStructureTree,
      image_count: figures.total,
      images_with_alt: figures.withAlt,
      form_fields_total: formCounts.total,
      form_fields_labeled: formCounts.labeled,
      reading_order_defined: readingOrderDefined,
      score: computeScore(scoreParts),
      issues: buildIssues({ ...scoreParts, hasStructureTree }),
    };
  } catch {
    return { ...ZERO_RESULT_ON_PARSE_ERROR, issues: ['parse_error'] };
  }
}
