import { readFileSync, writeFileSync, renameSync, appendFileSync, existsSync } from "fs";
import { join } from "path";
import matter from "gray-matter";
import { ScreenFrontmatter, type AnnotateArtifactStatus } from "@companion/shared";
import type { ScreensRepo } from "./screens-repo";

export interface ArtifactAnnotation {
  anchor: "element" | "text" | "mermaid";
  target_uid?: string | undefined;
  selector?: string | undefined;
  tag?: string | undefined;
  text_excerpt?: string | undefined;
  range?: { start: number; end: number } | undefined;
  diagram_id?: string | undefined;
  node_id?: string | undefined;
  note: string;
}

export interface ArtifactRepo {
  /** Append one annotation to the screen's sidecar annotations.jsonl. Returns the new total count. */
  appendAnnotation(screenId: string, annotation: ArtifactAnnotation): number;
  /** Count annotations recorded so far for a screen. */
  countAnnotations(screenId: string): number;
  /** Flip the screen frontmatter `status` atomically. */
  setStatus(screenId: string, status: AnnotateArtifactStatus): void;
}

export function createArtifactRepo(screens: ScreensRepo, sessionDir: string): ArtifactRepo {
  const screensDir = join(sessionDir, "screens");

  function requireArtifact(screenId: string) {
    const s = screens.get(screenId);
    if (!s) throw new Error(`unknown screen ${screenId}`);
    if (s.frontmatter.kind !== "annotate-artifact") {
      throw new Error(`screen ${screenId} is not kind: annotate-artifact`);
    }
    return s;
  }

  function annotationsPath(screenId: string): string {
    return join(screensDir, `${screenId}.annotations.jsonl`);
  }

  return {
    appendAnnotation(screenId, annotation) {
      requireArtifact(screenId);
      const p = annotationsPath(screenId);
      appendFileSync(p, JSON.stringify(annotation) + "\n");
      return this.countAnnotations(screenId);
    },

    countAnnotations(screenId) {
      const p = annotationsPath(screenId);
      if (!existsSync(p)) return 0;
      return readFileSync(p, "utf8").split("\n").filter(Boolean).length;
    },

    setStatus(screenId, status) {
      const s = requireArtifact(screenId);
      // Read fresh from disk to avoid drift with the watcher.
      const raw = readFileSync(s.path, "utf8");
      const parsed = matter(raw);
      const front = ScreenFrontmatter.parse(parsed.data);
      if (front.kind !== "annotate-artifact") {
        throw new Error(`screen ${screenId} is not kind: annotate-artifact`);
      }
      parsed.data.status = status;
      const out = matter.stringify(parsed.content, parsed.data);
      const tmp = s.path + ".tmp";
      writeFileSync(tmp, out);
      renameSync(tmp, s.path);
    },
  };
}
