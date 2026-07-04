export interface ScreenSummary { id: string; kind: "question"|"demo"|"decision"|"cards"|"summary-confirm"|"strategy-card"|"annotate-artifact"; title: string; pinned: boolean; }

export interface ArtifactTarget {
  anchor: "element"|"text"|"mermaid";
  selector?: string; tag?: string; text_excerpt?: string;
  range?: { start: number; end: number };
  diagram_id?: string; node_id?: string;
  note: string;
}
export async function annotateArtifact(screenId: string, target: ArtifactTarget) {
  return (await fetch(`/api/artifact/${encodeURIComponent(screenId)}/annotate`, {
    method: "POST", headers: { "content-type": "application/json" },
    body: JSON.stringify(target),
  })).json();
}
export async function approveArtifact(screenId: string) {
  return (await fetch(`/api/artifact/${encodeURIComponent(screenId)}/approve`, {
    method: "POST", headers: { "content-type": "application/json" }, body: "{}",
  })).json();
}
export async function requestArtifactChanges(screenId: string, note?: string) {
  return (await fetch(`/api/artifact/${encodeURIComponent(screenId)}/request-changes`, {
    method: "POST", headers: { "content-type": "application/json" },
    body: JSON.stringify({ note }),
  })).json();
}
export async function resolveLayout(screenId: string, resolution: "fix-first"|"override", findings: unknown[]) {
  return (await fetch(`/api/layout/${encodeURIComponent(screenId)}/${resolution}`, {
    method: "POST", headers: { "content-type": "application/json" },
    body: JSON.stringify({ findings }),
  })).json();
}

export async function moveCard(screenId: string, cardId: string, toCluster: string | null | undefined, order: number) {
  return (await fetch(`/api/cards/${encodeURIComponent(screenId)}/move`, {
    method: "POST", headers: { "content-type": "application/json" },
    body: JSON.stringify({ card_id: cardId, to_cluster: toCluster, order }),
  })).json();
}
export async function killCard(screenId: string, cardId: string) {
  return (await fetch(`/api/cards/${encodeURIComponent(screenId)}/kill`, {
    method: "POST", headers: { "content-type": "application/json" },
    body: JSON.stringify({ card_id: cardId }),
  })).json();
}
export async function createCluster(screenId: string, clusterId: string, label: string) {
  return (await fetch(`/api/cards/${encodeURIComponent(screenId)}/cluster`, {
    method: "POST", headers: { "content-type": "application/json" },
    body: JSON.stringify({ cluster_id: clusterId, label }),
  })).json();
}
export interface DecisionSummary {
  id: string;
  title: string;
  status: "proposed"|"approved"|"revised"|"rejected";
  depends_on?: string[];
  chosen_option?: string;
  note?: string;
}
export interface DocEntry { root: string; path: string; rel: string; }

export async function listScreens(): Promise<ScreenSummary[]> {
  return (await fetch("/api/screens")).json();
}
export async function getScreen(id: string) {
  return (await fetch(`/api/screens/${encodeURIComponent(id)}`)).json();
}
export async function listDecisions(): Promise<DecisionSummary[]> {
  return (await fetch("/api/decisions")).json();
}
export async function getDecision(id: string) {
  return (await fetch(`/api/decisions/${encodeURIComponent(id)}`)).json();
}
export async function listDocs(): Promise<DocEntry[]> {
  return (await fetch("/api/docs")).json();
}
export async function getDoc(path: string): Promise<string> {
  return (await fetch(`/api/docs/file?path=${encodeURIComponent(path)}`)).text();
}
export async function submitAnswer(screenId: string, inputs: Record<string, unknown>) {
  const client_submission_id = crypto.randomUUID();
  return (await fetch("/api/answer", {
    method: "POST", headers: { "content-type": "application/json" },
    body: JSON.stringify({ screen_id: screenId, client_submission_id, inputs }),
  })).json();
}
export async function privateSave(screenId: string, name: string, path: string, contents: string) {
  return (await fetch("/api/private-save", {
    method: "POST", headers: { "content-type": "application/json" },
    body: JSON.stringify({ screen_id: screenId, name, path, contents }),
  })).json();
}
export async function updateDecision(id: string, status: string, chosen_option?: string, note?: string) {
  return (await fetch(`/api/decisions/${encodeURIComponent(id)}`, {
    method: "POST", headers: { "content-type": "application/json" },
    body: JSON.stringify({ status, chosen_option, note }),
  })).json();
}
