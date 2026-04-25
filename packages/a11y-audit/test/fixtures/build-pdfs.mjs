// Build script for the three PDF fixtures used by pdf-a11y.test.ts.
//
// Run: `node test/fixtures/build-pdfs.mjs` from the a11y-audit package.
// Output: tagged.pdf, untagged.pdf, mixed.pdf (committed to git so tests
// don't need pdf-lib at runtime to regenerate them).
//
// pdf-lib does NOT expose StructTreeRoot as a first-class object, so we
// poke the catalog/info dicts via the raw PDFDict/PDFArray API. This is
// the explicit path called out in the task spec.

import { writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  PDFDocument,
  PDFName,
  PDFString,
} from 'pdf-lib';

const HERE = dirname(fileURLToPath(import.meta.url));

async function buildUntagged() {
  // No MarkInfo, no StructTreeRoot, no Lang, no Title.
  const doc = await PDFDocument.create();
  const page = doc.addPage([400, 400]);
  const font = await doc.embedFont('Helvetica');
  page.drawText('Hello untagged world', { x: 50, y: 350, size: 16, font });
  return await doc.save();
}

async function buildTagged() {
  // MarkInfo /Marked true, StructTreeRoot with one Figure /Alt, Lang, Title.
  const doc = await PDFDocument.create();
  const page = doc.addPage([400, 400]);
  const font = await doc.embedFont('Helvetica');
  page.drawText('Hello tagged world', { x: 50, y: 350, size: 16, font });

  doc.setTitle('Tagged Sample');

  const ctx = doc.context;
  doc.catalog.set(
    PDFName.of('MarkInfo'),
    ctx.obj({ Marked: true }),
  );
  doc.catalog.set(PDFName.of('Lang'), PDFString.of('en-US'));

  const figure = ctx.obj({
    Type: 'StructElem',
    S: 'Figure',
    Alt: PDFString.of('Hello world banner image'),
  });
  const figureRef = ctx.register(figure);

  const structTreeRoot = ctx.obj({
    Type: 'StructTreeRoot',
    K: [figureRef],
  });
  const strRef = ctx.register(structTreeRoot);
  doc.catalog.set(PDFName.of('StructTreeRoot'), strRef);

  return await doc.save();
}

async function buildMixed() {
  // Tagged: yes. Lang: yes. Title: NO. StructTreeRoot: yes with one Figure
  // missing /Alt. AcroForm: one form field WITHOUT /TU.
  const doc = await PDFDocument.create();
  const page = doc.addPage([400, 400]);
  const font = await doc.embedFont('Helvetica');
  page.drawText('Mixed accessibility', { x: 50, y: 350, size: 16, font });

  // Form field (no TU)
  const form = doc.getForm();
  const tf = form.createTextField('comments');
  tf.addToPage(page, { x: 50, y: 200, width: 200, height: 30 });

  const ctx = doc.context;
  doc.catalog.set(
    PDFName.of('MarkInfo'),
    ctx.obj({ Marked: true }),
  );
  doc.catalog.set(PDFName.of('Lang'), PDFString.of('en-US'));

  // Two figures: one with Alt, one without
  const figureGood = ctx.obj({
    Type: 'StructElem',
    S: 'Figure',
    Alt: PDFString.of('chart of revenue'),
  });
  const figureBad = ctx.obj({
    Type: 'StructElem',
    S: 'Figure',
  });
  const goodRef = ctx.register(figureGood);
  const badRef = ctx.register(figureBad);

  const structTreeRoot = ctx.obj({
    Type: 'StructTreeRoot',
    K: [goodRef, badRef],
  });
  const strRef = ctx.register(structTreeRoot);
  doc.catalog.set(PDFName.of('StructTreeRoot'), strRef);

  return await doc.save();
}

async function main() {
  const targets = [
    ['untagged.pdf', await buildUntagged()],
    ['tagged.pdf', await buildTagged()],
    ['mixed.pdf', await buildMixed()],
  ];
  for (const [name, bytes] of targets) {
    const path = join(HERE, name);
    writeFileSync(path, bytes);
    // eslint-disable-next-line no-console
    console.log(`wrote ${path} (${bytes.length} bytes)`);
  }
}

main().catch((err) => {
  // eslint-disable-next-line no-console
  console.error(err);
  process.exit(1);
});
