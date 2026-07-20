import { useEffect, useRef, useState } from "preact/hooks";
import { getScreen, moveCard, killCard, createCluster } from "../lib/api";
import { renderMarkdown } from "../lib/markdown";
import { renderAllMermaidBlocks } from "../lib/mermaid";
import { useRefresh } from "../lib/sse";

interface CardItem {
  id: string;
  text: string;
  cluster?: string;
  killed: boolean;
  order: number;
}
interface ClusterItem { id: string; label: string }

const UNCLUSTERED = "__unclustered__";

export function CardsView({ params }: { params: { id: string } }) {
  const [screen, setScreen] = useState<any>(null);
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [newClusterLabel, setNewClusterLabel] = useState<string>("");
  const bodyRef = useRef<HTMLDivElement>(null);

  async function refresh() {
    const s = await getScreen(params.id);
    setScreen(s);
  }
  useEffect(() => { void refresh(); }, [params.id]);
  useRefresh(ev => {
    if (ev.kind === "screen" && ev.id === params.id) void refresh();
  });
  useEffect(() => { if (bodyRef.current) void renderAllMermaidBlocks(bodyRef.current); }, [screen?.frontmatter?.id]);

  if (!screen) return <p>Loading…</p>;
  const fm = screen.frontmatter;
  if (fm.kind !== "cards") return <p>Wrong kind for this view.</p>;

  const items: CardItem[] = fm.items.filter((c: CardItem) => !c.killed);
  const clusters: ClusterItem[] = fm.clusters ?? [];

  // Group cards by cluster id (unclustered cards bucket under UNCLUSTERED)
  const buckets = new Map<string, CardItem[]>();
  buckets.set(UNCLUSTERED, []);
  for (const cl of clusters) buckets.set(cl.id, []);
  for (const c of items) {
    const key = c.cluster && buckets.has(c.cluster) ? c.cluster : UNCLUSTERED;
    buckets.get(key)!.push(c);
  }
  for (const arr of buckets.values()) arr.sort((a, b) => a.order - b.order);

  function onDragStart(cardId: string) {
    return (e: DragEvent) => {
      setDraggingId(cardId);
      e.dataTransfer?.setData("text/plain", cardId);
      if (e.dataTransfer) e.dataTransfer.effectAllowed = "move";
    };
  }
  function onDragOver(e: DragEvent) {
    e.preventDefault();
    if (e.dataTransfer) e.dataTransfer.dropEffect = "move";
  }
  function onDrop(targetCluster: string | null) {
    return async (e: DragEvent) => {
      e.preventDefault();
      const cardId = draggingId ?? e.dataTransfer?.getData("text/plain");
      if (!cardId) return;
      setDraggingId(null);
      const targetBucket = buckets.get(targetCluster ?? UNCLUSTERED) ?? [];
      const order = targetBucket.length;
      await moveCard(params.id, cardId, targetCluster, order);
    };
  }
  async function onKill(cardId: string) {
    await killCard(params.id, cardId);
  }
  async function onCreateCluster() {
    const label = newClusterLabel.trim();
    if (!label) return;
    const id = "cluster-" + Math.random().toString(36).slice(2, 8);
    await createCluster(params.id, id, label);
    setNewClusterLabel("");
  }

  function renderBucket(key: string, label: string, targetCluster: string | null) {
    const list = buckets.get(key) ?? [];
    return (
      <section
        key={key}
        class="cards-bucket"
        onDragOver={onDragOver}
        onDrop={(e: DragEvent) => { void onDrop(targetCluster)(e); }}
        style={{ border: "1px solid var(--border, #ccc)", borderRadius: 6, padding: 8, marginBottom: 12 }}
      >
        <h3 style={{ margin: "0 0 8px 0" }}>{label} <span class="muted">({list.length})</span></h3>
        <ul class="cards-list" style={{ listStyle: "none", padding: 0, margin: 0, minHeight: 32 }}>
          {list.map(c => (
            <li
              key={c.id}
              class="card"
              draggable
              onDragStart={onDragStart(c.id)}
              data-card-id={c.id}
              style={{
                padding: 8, marginBottom: 6,
                background: "var(--card-bg, #f6f6f6)",
                border: "1px solid var(--border, #ddd)",
                borderRadius: 4,
                cursor: "grab",
                display: "flex", justifyContent: "space-between", alignItems: "center",
              }}
            >
              <span class="card-text">{c.text}</span>
              <button
                type="button"
                class="kill"
                aria-label={`Kill card ${c.id}`}
                onClick={() => { void onKill(c.id); }}
                style={{ marginLeft: 8 }}
              >
                ✕
              </button>
            </li>
          ))}
          {list.length === 0 && <li class="muted" style={{ fontStyle: "italic" }}>drop cards here</li>}
        </ul>
      </section>
    );
  }

  return (
    <article class="cards-view">
      <h2>{fm.title}</h2>
      <div class="markdown" ref={bodyRef} dangerouslySetInnerHTML={{ __html: renderMarkdown(screen.body) }} />

      <div class="cluster-create" style={{ display: "flex", gap: 8, margin: "12px 0" }}>
        <input
          type="text"
          placeholder="New cluster label"
          value={newClusterLabel}
          onInput={(e: any) => setNewClusterLabel(e.currentTarget.value)}
        />
        <button type="button" onClick={() => { void onCreateCluster(); }}>+ Cluster</button>
      </div>

      {renderBucket(UNCLUSTERED, "Unclustered", null)}
      {clusters.map(cl => renderBucket(cl.id, cl.label, cl.id))}
    </article>
  );
}
