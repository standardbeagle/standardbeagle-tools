import { readFileSync, writeFileSync, renameSync } from "fs";
import matter from "gray-matter";
import { ScreenFrontmatter, type Card, type Cluster } from "@companion/shared";
import type { ScreensRepo } from "./screens-repo";

export interface CardsRepo {
  /**
   * Apply a mutation to a cards screen and persist the result atomically
   * (write to .tmp, rename over original). Returns the updated frontmatter.
   * The mutator receives a draft of items and clusters and is expected to
   * mutate them in place; the repo re-validates against the schema after.
   */
  mutate(
    screenId: string,
    mutator: (draft: { items: Card[]; clusters: Cluster[] }) => void
  ): { items: Card[]; clusters: Cluster[] };
}

export function createCardsRepo(screens: ScreensRepo): CardsRepo {
  return {
    mutate(screenId, mutator) {
      const s = screens.get(screenId);
      if (!s) throw new Error(`unknown screen ${screenId}`);
      if (s.frontmatter.kind !== "cards") throw new Error(`screen ${screenId} is not kind: cards`);

      // Read fresh from disk to avoid drift between watcher reload and our write
      const raw = readFileSync(s.path, "utf8");
      const parsed = matter(raw);
      const front = ScreenFrontmatter.parse(parsed.data);
      if (front.kind !== "cards") throw new Error(`screen ${screenId} is not kind: cards`);

      const draft = { items: [...front.items], clusters: [...front.clusters] };
      mutator(draft);

      // Re-validate the mutated frontmatter through the discriminated union
      const next = ScreenFrontmatter.parse({ ...front, items: draft.items, clusters: draft.clusters });
      if (next.kind !== "cards") throw new Error("mutation produced non-cards frontmatter");

      const out = matter.stringify(parsed.content, next);
      const tmp = s.path + ".tmp";
      writeFileSync(tmp, out);
      renameSync(tmp, s.path);
      return { items: next.items, clusters: next.clusters };
    },
  };
}
