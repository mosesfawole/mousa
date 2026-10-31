import { expect, it } from "vitest";
import { sampleDraft, sampleIdeas } from "@/lib/sample";

it("offers distinct authored draft examples for each sample angle", () => {
  const ideas = sampleIdeas({
    niche: "Developers",
    topic: "Lessons from shipping",
    tone: "casual",
  });
  const drafts = ideas.map(({ idea }) => sampleDraft(idea));
  expect(new Set(drafts.map((draft) => draft.tweet)).size).toBe(5);
  expect(
    drafts.every(
      (draft) => draft.source === "sample" && draft.tweet.length <= 280,
    ),
  ).toBe(true);
});
