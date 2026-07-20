import { z } from "zod";

export const InputDef = z.discriminatedUnion("type", [
  z.object({
    type: z.literal("radio"),
    name: z.string().min(1),
    label: z.string().optional(),
    options: z.array(z.union([z.string(), z.object({ value: z.string(), label: z.string() })])).min(2),
    private: z.literal(false).optional(),
  }),
  z.object({
    type: z.literal("multi"),
    name: z.string().min(1),
    label: z.string().optional(),
    options: z.array(z.union([z.string(), z.object({ value: z.string(), label: z.string() })])).min(2),
    private: z.literal(false).optional(),
  }),
  z.object({
    type: z.literal("text"),
    name: z.string().min(1),
    label: z.string().optional(),
    multiline: z.boolean().default(false),
    placeholder: z.string().optional(),
    private: z.boolean().default(false),
  }),
  z.object({
    type: z.literal("code"),
    name: z.string().min(1),
    label: z.string().optional(),
    language: z.string().default("text"),
    placeholder: z.string().optional(),
    private: z.boolean().default(false),
  }),
  z.object({
    type: z.literal("file-edit"),
    name: z.string().min(1).optional(),
    path: z.string().min(1),
    language: z.string().optional(),
    private: z.literal(true),
  }),
]);
export type InputDef = z.infer<typeof InputDef>;

export const QuestionScreen = z.object({
  kind: z.literal("question"),
  id: z.string().min(1),
  title: z.string().min(1),
  pinned: z.boolean().default(false),
  inputs: z.array(InputDef).min(1),
});

export const DemoScreen = z.object({
  kind: z.literal("demo"),
  id: z.string().min(1),
  title: z.string().min(1),
  pinned: z.boolean().default(false),
  demo: z.object({
    type: z.literal("srcdoc"),
    html: z.string().optional(),
    css: z.string().optional(),
    js: z.string().optional(),
    inlineHtml: z.string().optional(),
    inlineCss: z.string().optional(),
    inlineJs: z.string().optional(),
    viewport: z.object({ width: z.number().int().positive(), height: z.number().int().positive() }).default({ width: 480, height: 720 }),
  }).refine(d => d.html || d.inlineHtml, { message: "demo requires html path or inlineHtml" }),
  actions: z.array(z.object({
    type: z.enum(["approve", "revise", "reject"]),
    label: z.string().min(1),
    requires_note: z.boolean().default(false),
  })).min(1),
});

export const DecisionOption = z.object({
  id: z.string().min(1),
  label: z.string().min(1),
  recommended: z.boolean().default(false),
});

export const DecisionScreen = z.object({
  kind: z.literal("decision"),
  id: z.string().min(1),
  title: z.string().min(1),
  pinned: z.boolean().default(false),
  status: z.enum(["proposed", "approved", "revised", "rejected"]).default("proposed"),
  options: z.array(DecisionOption).min(2),
  depends_on: z.array(z.string()).default([]),
  chosen_option: z.string().optional(),
  note: z.string().optional(),
});

export const Card = z.object({
  id: z.string().min(1),
  text: z.string().min(1),
  cluster: z.string().optional(),
  killed: z.boolean().default(false),
  order: z.number().int().nonnegative().default(0),
});
export type Card = z.infer<typeof Card>;

export const Cluster = z.object({
  id: z.string().min(1),
  label: z.string().min(1),
});
export type Cluster = z.infer<typeof Cluster>;

export const CardsScreen = z.object({
  kind: z.literal("cards"),
  id: z.string().min(1),
  title: z.string().min(1),
  pinned: z.boolean().default(false),
  items: z.array(Card).min(1),
  clusters: z.array(Cluster).default([]),
});

export const ConfidencePill = z.enum(["high", "med", "low"]);
export type ConfidencePill = z.infer<typeof ConfidencePill>;

// Provenance tag on each summary-confirm bullet.
//
// Valid forms:
//   - "file:<path>:<line>"   codebase reference
//   - "memory:<id>"          memory entry reference
//   - "git:<sha>"            git commit reference
//   - "web:<url>"            web cite
//   - "guess"                literal — pure inference, no verifiable source
//
// We model this as a non-empty string rather than a stricter regex because:
//   (1) the contract is enforced by authors and surfaced in the UI, not by
//       runtime regex (a paths-with-colons + URL-with-port edge case set
//       would make a regex brittle); and
//   (2) the literal "guess" sentinel is the load-bearing rule — empty /
//       missing / null is a schema violation, which the .min(1) guarantees.
export const SummaryBullet = z.object({
  id: z.string().min(1),
  text: z.string().min(1),
  provenance: z.string().min(1),
});
export type SummaryBullet = z.infer<typeof SummaryBullet>;

export const SummarySection = z.object({
  confidence: ConfidencePill,
  bullets: z.array(SummaryBullet).min(1),
  mermaid: z.string().optional(),
});
export type SummarySection = z.infer<typeof SummarySection>;

export const SummaryConfirmStatus = z.enum(["pending", "confirmed", "revised"]);
export type SummaryConfirmStatus = z.infer<typeof SummaryConfirmStatus>;

export const SummaryConfirmScreen = z.object({
  kind: z.literal("summary-confirm"),
  id: z.string().min(1),
  title: z.string().min(1),
  pinned: z.boolean().default(false),
  status: SummaryConfirmStatus.default("pending"),
  sections: z.object({
    goal: SummarySection,
    constraints: SummarySection,
    system_shape: SummarySection,
    risks: SummarySection,
    alternative_framings: SummarySection,
  }),
});

export const StrategyProvenance = z.object({
  label: z.string().min(1),
  path: z.string().optional(),
});
export type StrategyProvenance = z.infer<typeof StrategyProvenance>;

export const StrategyOption = z.object({
  id: z.string().min(1),
  label: z.string().min(1),
  summary: z.string().min(1),
  recommendation_confidence: ConfidencePill,
  bundles_resolves: z.array(z.string()).default([]),
  unlocks: z.array(z.string()).default([]),
  locks_out: z.array(z.string()).default([]),
  seen_in: z.array(StrategyProvenance).default([]),
  reconsider_when: z.array(z.string()).default([]),
  rank: z.number().int().nonnegative().default(0),
});
export type StrategyOption = z.infer<typeof StrategyOption>;

export const StrategyStage = z.enum(["diverge", "converge"]);
export type StrategyStage = z.infer<typeof StrategyStage>;

export const StrategyCardScreen = z.object({
  kind: z.literal("strategy-card"),
  id: z.string().min(1),
  title: z.string().min(1),
  pinned: z.boolean().default(false),
  stage: StrategyStage.default("diverge"),
  options: z.array(StrategyOption).min(2),
  selected_option: z.string().nullable().default(null),
  user_comments: z.string().nullable().default(null),
});

// Lavish-derived: render an agent-authored HTML artifact and let the user mark
// up individual elements / text ranges / mermaid nodes rather than pick from
// pre-authored options. See docs/screen-format.md `kind: annotate-artifact`.
export const AnnotateArtifactStatus = z.enum(["pending", "approved", "changes-requested"]);
export type AnnotateArtifactStatus = z.infer<typeof AnnotateArtifactStatus>;

export const AnnotateArtifactScreen = z.object({
  kind: z.literal("annotate-artifact"),
  id: z.string().min(1),
  title: z.string().min(1),
  pinned: z.boolean().default(false),
  status: AnnotateArtifactStatus.default("pending"),
  artifact: z.object({
    type: z.literal("srcdoc"),
    html: z.string().optional(),
    css: z.string().optional(),
    js: z.string().optional(),
    inlineHtml: z.string().optional(),
    inlineCss: z.string().optional(),
    inlineJs: z.string().optional(),
    viewport: z.object({ width: z.number().int().positive(), height: z.number().int().positive() }).default({ width: 900, height: 640 }),
  }).refine(d => d.html || d.inlineHtml, { message: "artifact requires html path or inlineHtml" }),
  mode: z.enum(["annotate", "explore"]).default("annotate"),
  layout_audit: z.boolean().default(false),
  actions: z.array(z.object({
    type: z.enum(["approve", "request-changes"]),
    label: z.string().min(1),
    requires_note: z.boolean().default(false),
  })).min(1),
});

export const ScreenFrontmatter = z.discriminatedUnion("kind", [
  QuestionScreen,
  DemoScreen,
  DecisionScreen,
  CardsScreen,
  SummaryConfirmScreen,
  StrategyCardScreen,
  AnnotateArtifactScreen,
]);
export type ScreenFrontmatter = z.infer<typeof ScreenFrontmatter>;

export interface Screen {
  frontmatter: ScreenFrontmatter;
  body: string;
  path: string;
}
