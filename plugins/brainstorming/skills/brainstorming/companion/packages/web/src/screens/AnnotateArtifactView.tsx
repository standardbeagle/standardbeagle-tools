import { useEffect, useRef, useState } from "preact/hooks";
import { getScreen, annotateArtifact, approveArtifact, requestArtifactChanges, resolveLayout } from "../lib/api";
import { renderMarkdown } from "../lib/markdown";
import { renderAllMermaidBlocks } from "../lib/mermaid";

// Injected into the sandboxed artifact iframe. One-way channel: the artifact
// posts a target selection (element / text / mermaid node) to the parent, which
// holds the note text. Also runs the render-time layout audit.
function sdk(mode: string, layoutAudit: boolean): string {
  return `
<script>
(function () {
  var ANNOTATE = ${JSON.stringify(mode)} === "annotate";
  function cssPath(el) {
    if (el.id) return "#" + el.id;
    var parts = [];
    while (el && el.nodeType === 1 && parts.length < 6) {
      var sel = el.tagName.toLowerCase();
      var p = el.parentElement;
      if (p) {
        var sibs = Array.prototype.filter.call(p.children, function (c) { return c.tagName === el.tagName; });
        if (sibs.length > 1) sel += ":nth-of-type(" + (sibs.indexOf(el) + 1) + ")";
      }
      parts.unshift(sel);
      el = p;
    }
    return parts.join(" > ");
  }
  function post(msg) { window.parent.postMessage(msg, "*"); }
  function mermaidNode(el) {
    var n = el.closest ? el.closest(".node, [data-mermaid-node], g.node") : null;
    if (!n) return null;
    var svg = n.closest ? n.closest("svg") : null;
    return { diagram_id: (svg && svg.id) || "", node_id: n.id || (n.getAttribute && n.getAttribute("data-mermaid-node")) || "", label: (n.textContent || "").trim().slice(0, 120) };
  }
  if (ANNOTATE) {
    var hl;
    document.addEventListener("mouseover", function (e) {
      if (hl) hl.style.outline = "";
      hl = e.target; if (hl && hl.style) hl.style.outline = "2px solid #f59e0b";
    });
    document.addEventListener("click", function (e) {
      e.preventDefault();
      var m = mermaidNode(e.target);
      if (m) { post({ kind: "artifact_target", anchor: "mermaid", diagram_id: m.diagram_id, node_id: m.node_id, text_excerpt: m.label }); return; }
      var t = e.target;
      post({ kind: "artifact_target", anchor: "element", selector: cssPath(t), tag: t.tagName.toLowerCase(), text_excerpt: (t.textContent || "").trim().slice(0, 120) });
    }, true);
    document.addEventListener("mouseup", function () {
      var s = window.getSelection && window.getSelection();
      if (!s || s.isCollapsed || !s.toString().trim()) return;
      var node = s.anchorNode && s.anchorNode.nodeType === 1 ? s.anchorNode : (s.anchorNode && s.anchorNode.parentElement);
      post({ kind: "artifact_target", anchor: "text", selector: node ? cssPath(node) : "", text_excerpt: s.toString().trim().slice(0, 200), range: { start: s.anchorOffset, end: s.focusOffset } });
    });
  }
  if (${layoutAudit ? "true" : "false"}) {
    window.addEventListener("load", function () {
      var findings = [];
      var all = document.querySelectorAll("*");
      for (var i = 0; i < all.length; i++) {
        var el = all[i];
        var st = getComputedStyle(el);
        if (st.overflowX === "auto" || st.overflowX === "scroll" || st.overflowY === "auto" || st.overflowY === "scroll") continue;
        var overX = el.scrollWidth - el.clientWidth;
        if (overX > 1 && el.clientWidth > 0) {
          findings.push({ selector: cssPath(el), kind: "element-scroll-overflow", overflowPx: overX, viewportWidth: document.documentElement.clientWidth, severity: "warn" });
          if (findings.length >= 25) break;
        }
      }
      post({ kind: "layout_findings", findings: findings });
    });
  }
})();
</script>`;
}

type Target = {
  anchor: "element" | "text" | "mermaid";
  selector?: string;
  tag?: string;
  text_excerpt?: string;
  range?: { start: number; end: number };
  diagram_id?: string;
  node_id?: string;
};

type Finding = { selector: string; kind: string; overflowPx?: number; viewportWidth?: number; severity?: string };

export function AnnotateArtifactView({ params }: { params: { id: string } }) {
  const [screen, setScreen] = useState<any>(null);
  const [html, setHtml] = useState<string>("");
  const [target, setTarget] = useState<Target | null>(null);
  const [note, setNote] = useState<string>("");
  const [count, setCount] = useState<number>(0);
  const [findings, setFindings] = useState<Finding[] | null>(null);
  const [gateResolved, setGateResolved] = useState(false);
  const bodyRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setScreen(null); setHtml(""); setTarget(null); setNote(""); setCount(0);
    setFindings(null); setGateResolved(false);
    void getScreen(params.id).then(setScreen);
  }, [params.id]);

  useEffect(() => {
    if (!screen || screen.frontmatter.kind !== "annotate-artifact") return;
    const { artifact, mode, layout_audit } = screen.frontmatter;
    (async () => {
      const fetchAsset = async (file: string) =>
        (await fetch(`/api/artifact-asset?screen_id=${params.id}&file=${encodeURIComponent(file)}`)).text();
      const htmlBody = artifact.inlineHtml ?? (artifact.html ? await fetchAsset(artifact.html) : "");
      const css = artifact.inlineCss ?? (artifact.css ? await fetchAsset(artifact.css) : "");
      const js = artifact.inlineJs ?? (artifact.js ? await fetchAsset(artifact.js) : "");
      setHtml(`<!doctype html><html><head><style>${css}</style></head><body>${htmlBody}<script>${js}</script>${sdk(mode, layout_audit)}</body></html>`);
    })();
  }, [screen?.frontmatter?.id]);

  useEffect(() => { if (bodyRef.current) void renderAllMermaidBlocks(bodyRef.current); }, [screen?.frontmatter?.id]);

  useEffect(() => {
    function listener(e: MessageEvent) {
      const d = e.data;
      if (!d) return;
      if (d.kind === "artifact_target") {
        setTarget({ anchor: d.anchor, selector: d.selector, tag: d.tag, text_excerpt: d.text_excerpt, range: d.range, diagram_id: d.diagram_id, node_id: d.node_id });
      } else if (d.kind === "layout_findings") {
        if (Array.isArray(d.findings) && d.findings.length > 0) setFindings(d.findings);
        else setGateResolved(true);
      }
    }
    window.addEventListener("message", listener);
    return () => window.removeEventListener("message", listener);
  }, [params.id]);

  if (!screen) return <p>Loading…</p>;
  const fm = screen.frontmatter;
  if (fm.kind !== "annotate-artifact") return <p>Wrong kind.</p>;

  const gateOpen = fm.layout_audit && findings && findings.length > 0 && !gateResolved;

  async function addAnnotation() {
    if (!target || !note.trim()) return;
    const res = await annotateArtifact(params.id, { ...target, note: note.trim() });
    if (typeof res?.annotation_count === "number") setCount(res.annotation_count);
    setTarget(null); setNote("");
  }
  async function onApprove() { await approveArtifact(params.id); }
  async function onRequestChanges() { await requestArtifactChanges(params.id, note.trim() || undefined); }
  async function onFixFirst() { await resolveLayout(params.id, "fix-first", findings ?? []); setGateResolved(true); }
  async function onOverride() { await resolveLayout(params.id, "override", findings ?? []); setGateResolved(true); }

  const describe = (t: Target) =>
    t.anchor === "mermaid" ? `mermaid node ${t.node_id || "?"} — "${t.text_excerpt ?? ""}"`
    : t.anchor === "text" ? `text "${(t.text_excerpt ?? "").slice(0, 60)}"`
    : `${t.tag ?? "element"} · ${t.selector ?? ""}`;

  return (
    <article class="screen">
      <h2>{fm.title} <span class="badge" data-status={fm.status}>{fm.status}</span></h2>
      <div class="markdown" ref={bodyRef} dangerouslySetInnerHTML={{ __html: renderMarkdown(screen.body) }} />

      <div style={{ position: "relative" }}>
        {gateOpen && (
          <div class="layout-gate" style={{ position: "absolute", inset: 0, background: "rgba(20,20,20,0.92)", color: "#fff", zIndex: 10, padding: 16, borderRadius: 6, overflow: "auto" }}>
            <h3>Layout issues found ({findings!.length})</h3>
            <ul>
              {findings!.map((f, i) => (
                <li key={i}><code>{f.selector}</code> — {f.kind}{f.overflowPx ? ` (+${f.overflowPx}px)` : ""}</li>
              ))}
            </ul>
            <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
              <button onClick={onFixFirst}>Fix first (bounce to Claude)</button>
              <button onClick={onOverride}>Show anyway</button>
            </div>
          </div>
        )}
        <iframe
          class="artifact-frame"
          sandbox="allow-scripts"
          srcDoc={html}
          style={{ width: fm.artifact.viewport.width, height: fm.artifact.viewport.height, maxWidth: "100%", border: "1px solid var(--border)", borderRadius: 6 }}
        />
      </div>

      <div class="annotate-panel" style={{ marginTop: 12 }}>
        <p style={{ margin: "4px 0", opacity: 0.8 }}>
          {target ? <>Selected: <strong>{describe(target)}</strong></> : <>Click an element, select text, or click a mermaid node in {fm.mode} mode to anchor a note.</>}
        </p>
        <textarea placeholder="Annotation note" value={note} onInput={(e: any) => setNote(e.currentTarget.value)} style={{ width: "100%" }} />
        <div class="actions" style={{ marginTop: 8, display: "flex", gap: 8, flexWrap: "wrap" }}>
          <button onClick={addAnnotation} disabled={!target || !note.trim()}>Add annotation</button>
          <span style={{ opacity: 0.7, alignSelf: "center" }}>{count} annotation{count === 1 ? "" : "s"}</span>
          <span style={{ flex: 1 }} />
          {fm.actions.map((a: any) =>
            a.type === "approve"
              ? <button key="approve" onClick={onApprove}>{a.label}</button>
              : <button key="request-changes" onClick={onRequestChanges}>{a.label}</button>)}
        </div>
      </div>
    </article>
  );
}
