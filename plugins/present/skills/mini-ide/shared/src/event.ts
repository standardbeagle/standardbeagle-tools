import { z } from "zod";
import { DecisionStatus } from "./decision";

const Base = z.object({
  ts: z.number().int().nonnegative(),
  seq: z.number().int().nonnegative(),
  screen_id: z.string().optional(),
});

export const Event = z.discriminatedUnion("type", [
  Base.extend({ type: z.literal("answer"), inputs: z.record(z.any()) }),
  Base.extend({ type: z.literal("saved"), name: z.string(), path: z.string(), bytes: z.number().int(), sha256: z.string() }),
  Base.extend({ type: z.literal("demo_event"), name: z.string(), data: z.any().optional() }),
  Base.extend({ type: z.literal("demo_event_throttled"), dropped: z.number().int().nonnegative() }),
  Base.extend({ type: z.literal("decision"), id: z.string(), status: DecisionStatus, chosen_option: z.string().optional(), note: z.string().optional() }),
  Base.extend({ type: z.literal("navigate"), to: z.string(), from: z.string().optional() }),
  Base.extend({ type: z.literal("screen_error"), path: z.string(), message: z.string() }),
  Base.extend({ type: z.literal("save_error"), name: z.string(), path: z.string(), errno: z.string() }),
  Base.extend({ type: z.literal("server_ready"), url: z.string(), port: z.number().int(), pid: z.number().int() }),
  Base.extend({ type: z.literal("server_stopped"), reason: z.string() }),
  Base.extend({
    type: z.literal("card_moved"),
    card_id: z.string(),
    from_cluster: z.string().optional(),
    to_cluster: z.string().optional(),
    order: z.number().int().nonnegative(),
  }),
  Base.extend({ type: z.literal("card_killed"), card_id: z.string() }),
  Base.extend({ type: z.literal("cluster_created"), cluster_id: z.string(), label: z.string() }),
  // A bullet edit may change `text`, `provenance`, or both. Old / new
  // pairs are optional independently; at least one pair must be present
  // (callers should not emit a revision event with no actual change).
  Base.extend({
    type: z.literal("summary_bullet_revised"),
    bullet_id: z.string(),
    section: z.string(),
    old_text: z.string().optional(),
    new_text: z.string().optional(),
    old_provenance: z.string().optional(),
    new_provenance: z.string().optional(),
  }),
  Base.extend({ type: z.literal("summary_confirmed") }),
  Base.extend({
    type: z.literal("summary_revised"),
    diff: z.array(z.object({
      bullet_id: z.string(),
      section: z.string(),
      old_text: z.string().optional(),
      new_text: z.string().optional(),
      old_provenance: z.string().optional(),
      new_provenance: z.string().optional(),
    })),
    note: z.string().optional(),
  }),
  Base.extend({
    type: z.literal("strategy_ranked"),
    option_id: z.string(),
    old_rank: z.number().int().nonnegative(),
    new_rank: z.number().int().nonnegative(),
  }),
  Base.extend({
    type: z.literal("strategy_selected"),
    option_id: z.string(),
    user_comments: z.string().optional(),
  }),
  // Lavish-derived annotate-artifact flow. An annotation anchors to an element,
  // a text range, or a mermaid node; the anchor-specific fields are optional and
  // present only for that anchor kind.
  Base.extend({
    type: z.literal("artifact_annotation"),
    anchor: z.enum(["element", "text", "mermaid"]),
    target_uid: z.string().optional(),
    selector: z.string().optional(),
    tag: z.string().optional(),
    text_excerpt: z.string().optional(),
    range: z.object({ start: z.number().int(), end: z.number().int() }).optional(),
    diagram_id: z.string().optional(),
    node_id: z.string().optional(),
    note: z.string(),
  }),
  Base.extend({ type: z.literal("artifact_approved") }),
  Base.extend({
    type: z.literal("artifact_changes_requested"),
    note: z.string().optional(),
    annotation_count: z.number().int().nonnegative(),
  }),
  // Render-time layout gate (auditLayout). resolution records the user's choice.
  Base.extend({
    type: z.literal("layout_findings"),
    findings: z.array(z.object({
      selector: z.string(),
      kind: z.enum(["clipped-text", "element-scroll-overflow", "overlapping-text"]),
      overflowPx: z.number().optional(),
      viewportWidth: z.number().optional(),
      severity: z.string().optional(),
    })),
    resolution: z.enum(["fix-first", "override"]),
  }),
]);
export type Event = z.infer<typeof Event>;
