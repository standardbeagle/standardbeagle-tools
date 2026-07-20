import { test, expect } from "bun:test";
import { ScreenFrontmatter } from "../src/screen";

test("question screen with radio input parses", () => {
  const raw = {
    kind: "question",
    id: "deploy",
    title: "Where are we deploying?",
    inputs: [
      { type: "radio", name: "target", options: ["k8s", "lambda"] },
    ],
  };
  const parsed = ScreenFrontmatter.parse(raw);
  expect(parsed.kind).toBe("question");
  if (parsed.kind === "question") {
    expect(parsed.inputs[0].type).toBe("radio");
  }
});

test("question screen rejects an empty inputs array", () => {
  expect(() =>
    ScreenFrontmatter.parse({ kind: "question", id: "x", title: "x", inputs: [] })
  ).toThrow();
});

test("file-edit must be private: true", () => {
  expect(() =>
    ScreenFrontmatter.parse({
      kind: "question",
      id: "x",
      title: "x",
      inputs: [{ type: "file-edit", path: ".env", private: false }],
    })
  ).toThrow();
});

test("demo screen requires an html source", () => {
  expect(() =>
    ScreenFrontmatter.parse({
      kind: "demo",
      id: "x",
      title: "x",
      demo: { type: "srcdoc" },
      actions: [{ type: "approve", label: "ok" }],
    })
  ).toThrow();
});

test("demo screen with inline html/css/js parses", () => {
  const parsed = ScreenFrontmatter.parse({
    kind: "demo",
    id: "inline",
    title: "Inline demo",
    demo: {
      type: "srcdoc",
      inlineHtml: "<button id=b>Click</button>",
      inlineCss:  "#b { color: red; }",
      inlineJs:   "document.getElementById('b').onclick = () => window.__emit('clicked');",
    },
    actions: [{ type: "approve", label: "Ship it" }],
  });
  expect(parsed.kind).toBe("demo");
});

test("decision screen with options parses", () => {
  const parsed = ScreenFrontmatter.parse({
    kind: "decision",
    id: "d1",
    title: "Pick one",
    options: [
      { id: "a", label: "A", recommended: true },
      { id: "b", label: "B" },
    ],
  });
  expect(parsed.kind).toBe("decision");
});

test("decision screen parses depends_on", () => {
  const parsed = ScreenFrontmatter.parse({
    kind: "decision",
    id: "d2",
    title: "Depends on auth",
    depends_on: ["d1"],
    options: [
      { id: "a", label: "A" },
      { id: "b", label: "B" },
    ],
  });
  expect(parsed.kind).toBe("decision");
  if (parsed.kind === "decision") {
    expect(parsed.depends_on).toEqual(["d1"]);
  }
});

test("decision screen defaults depends_on to empty array", () => {
  const parsed = ScreenFrontmatter.parse({
    kind: "decision",
    id: "d3",
    title: "No deps",
    options: [{ id: "a", label: "A" }, { id: "b", label: "B" }],
  });
  if (parsed.kind === "decision") {
    expect(parsed.depends_on).toEqual([]);
  }
});

test("summary-confirm screen with all five sections parses", () => {
  const parsed = ScreenFrontmatter.parse({
    kind: "summary-confirm",
    id: "phase-0",
    title: "Architect summary",
    sections: {
      goal: { confidence: "high", bullets: [{ id: "g1", text: "Add OAuth", provenance: "memory:project_x" }] },
      constraints: { confidence: "med", bullets: [{ id: "c1", text: "2-week ship", provenance: "memory:sprint_25" }] },
      system_shape: {
        confidence: "med",
        bullets: [{ id: "s1", text: "Express middleware", provenance: "file:src/middleware/auth.ts:42" }],
        mermaid: "graph LR\n  A-->B",
      },
      risks: { confidence: "low", bullets: [{ id: "r1", text: "Provider lock-in", provenance: "guess" }] },
      alternative_framings: { confidence: "low", bullets: [{ id: "a1", text: "SSO-only framing", provenance: "guess" }] },
    },
  });
  expect(parsed.kind).toBe("summary-confirm");
  if (parsed.kind === "summary-confirm") {
    expect(parsed.status).toBe("pending");
    expect(parsed.sections.system_shape.mermaid).toContain("graph LR");
    expect(parsed.sections.goal.bullets[0].provenance).toBe("memory:project_x");
    expect(parsed.sections.risks.bullets[0].provenance).toBe("guess");
  }
});

test("summary-confirm screen rejects an unknown confidence pill", () => {
  expect(() =>
    ScreenFrontmatter.parse({
      kind: "summary-confirm",
      id: "x",
      title: "x",
      sections: {
        goal: { confidence: "very-high", bullets: [{ id: "g1", text: "x", provenance: "guess" }] },
        constraints: { confidence: "med", bullets: [{ id: "c1", text: "x", provenance: "guess" }] },
        system_shape: { confidence: "med", bullets: [{ id: "s1", text: "x", provenance: "guess" }] },
        risks: { confidence: "low", bullets: [{ id: "r1", text: "x", provenance: "guess" }] },
        alternative_framings: { confidence: "low", bullets: [{ id: "a1", text: "x", provenance: "guess" }] },
      },
    })
  ).toThrow();
});

test("summary-confirm bullet without provenance is rejected", () => {
  // Empty / missing provenance is a contract violation — must use literal "guess" instead.
  expect(() =>
    ScreenFrontmatter.parse({
      kind: "summary-confirm",
      id: "x",
      title: "x",
      sections: {
        // goal bullet missing provenance entirely
        goal: { confidence: "high", bullets: [{ id: "g1", text: "x" }] },
        constraints: { confidence: "med", bullets: [{ id: "c1", text: "x", provenance: "guess" }] },
        system_shape: { confidence: "med", bullets: [{ id: "s1", text: "x", provenance: "guess" }] },
        risks: { confidence: "low", bullets: [{ id: "r1", text: "x", provenance: "guess" }] },
        alternative_framings: { confidence: "low", bullets: [{ id: "a1", text: "x", provenance: "guess" }] },
      },
    })
  ).toThrow();
});

test("summary-confirm bullet with empty-string provenance is rejected", () => {
  // Empty string is also a violation — authors must explicitly use "guess".
  expect(() =>
    ScreenFrontmatter.parse({
      kind: "summary-confirm",
      id: "x",
      title: "x",
      sections: {
        goal: { confidence: "high", bullets: [{ id: "g1", text: "x", provenance: "" }] },
        constraints: { confidence: "med", bullets: [{ id: "c1", text: "x", provenance: "guess" }] },
        system_shape: { confidence: "med", bullets: [{ id: "s1", text: "x", provenance: "guess" }] },
        risks: { confidence: "low", bullets: [{ id: "r1", text: "x", provenance: "guess" }] },
        alternative_framings: { confidence: "low", bullets: [{ id: "a1", text: "x", provenance: "guess" }] },
      },
    })
  ).toThrow();
});

test("summary-confirm bullet accepts all five provenance forms", () => {
  // file:path:line, memory:id, git:sha, web:url, guess
  const parsed = ScreenFrontmatter.parse({
    kind: "summary-confirm",
    id: "x",
    title: "x",
    sections: {
      goal: { confidence: "high", bullets: [{ id: "g1", text: "x", provenance: "file:src/foo.ts:10" }] },
      constraints: {
        confidence: "med",
        bullets: [
          { id: "c1", text: "x", provenance: "memory:project_x_oauth" },
          { id: "c2", text: "x", provenance: "git:a50381f" },
        ],
      },
      system_shape: {
        confidence: "med",
        bullets: [{ id: "s1", text: "x", provenance: "web:https://example.com/spec" }],
      },
      risks: { confidence: "low", bullets: [{ id: "r1", text: "x", provenance: "guess" }] },
      alternative_framings: { confidence: "low", bullets: [{ id: "a1", text: "x", provenance: "guess" }] },
    },
  });
  if (parsed.kind === "summary-confirm") {
    expect(parsed.sections.goal.bullets[0].provenance).toBe("file:src/foo.ts:10");
    expect(parsed.sections.constraints.bullets[0].provenance).toBe("memory:project_x_oauth");
    expect(parsed.sections.constraints.bullets[1].provenance).toBe("git:a50381f");
    expect(parsed.sections.system_shape.bullets[0].provenance).toBe("web:https://example.com/spec");
    expect(parsed.sections.risks.bullets[0].provenance).toBe("guess");
  }
});

test("strategy-card screen with diverge stage parses", () => {
  const parsed = ScreenFrontmatter.parse({
    kind: "strategy-card",
    id: "phase-1-shape",
    title: "How should this fit?",
    stage: "diverge",
    options: [
      {
        id: "standalone",
        label: "Standalone service",
        summary: "Own deploy",
        recommendation_confidence: "med",
        rank: 0,
      },
      {
        id: "embedded",
        label: "Embedded module",
        summary: "Shared deploy",
        recommendation_confidence: "high",
        seen_in: [{ label: "billing", path: "services/billing/README.md" }],
        rank: 1,
      },
    ],
  });
  expect(parsed.kind).toBe("strategy-card");
  if (parsed.kind === "strategy-card") {
    expect(parsed.stage).toBe("diverge");
    expect(parsed.selected_option).toBeNull();
    expect(parsed.options[1].seen_in[0].path).toBe("services/billing/README.md");
  }
});

test("strategy-card screen requires at least 2 options", () => {
  expect(() =>
    ScreenFrontmatter.parse({
      kind: "strategy-card",
      id: "x",
      title: "x",
      options: [
        { id: "a", label: "A", summary: "x", recommendation_confidence: "high" },
      ],
    })
  ).toThrow();
});

test("strategy-card screen with converge stage and selected_option parses", () => {
  const parsed = ScreenFrontmatter.parse({
    kind: "strategy-card",
    id: "phase-1-shape",
    title: "How should this fit?",
    stage: "converge",
    options: [
      { id: "a", label: "A", summary: "a-sum", recommendation_confidence: "high" },
      { id: "b", label: "B", summary: "b-sum", recommendation_confidence: "low" },
    ],
    selected_option: "a",
    user_comments: "but use TTL=1hr",
  });
  if (parsed.kind === "strategy-card") {
    expect(parsed.selected_option).toBe("a");
    expect(parsed.user_comments).toBe("but use TTL=1hr");
  }
});

test("decision screen parses chosen_option and note when present", () => {
  const parsed = ScreenFrontmatter.parse({
    kind: "decision",
    id: "d1",
    title: "T",
    status: "approved",
    chosen_option: "a",
    note: "because",
    options: [
      { id: "a", label: "A" },
      { id: "b", label: "B" },
    ],
  });
  if (parsed.kind === "decision") {
    expect(parsed.chosen_option).toBe("a");
    expect(parsed.note).toBe("because");
  }
});
