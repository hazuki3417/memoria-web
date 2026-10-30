import { test } from "@playwright/test";
import { responsiveViewports } from "../../.storybook/responsiveViewports";
import { captureStory } from "./capture";

type StoryEntry = { id: string; type: string; tags?: string[] };

async function getVrtStories(): Promise<StoryEntry[]> {
  const endpoint = "http://127.0.0.1:6006/index.json";
  const deadline = Date.now() + 120_000;
  while (Date.now() < deadline) {
    try {
      const response = await fetch(endpoint, { signal: AbortSignal.timeout(5000) });
      if (response.ok) {
        const index = (await response.json()) as { entries?: Record<string, StoryEntry> };
        const stories = Object.values(index.entries ?? {})
          .filter((entry) => entry.type === "story" && entry.tags?.includes("vrt"))
          .sort((a, b) => a.id.localeCompare(b.id));
        if (!stories.length) throw new Error("No vrt-tagged stories found in Storybook index");
        return stories;
      }
    } catch (error) {
      if (error instanceof Error && error.message.startsWith("No vrt-tagged")) throw error;
    }
    await new Promise((resolve) => setTimeout(resolve, 1000));
  }
  throw new Error("Storybook index.json was unavailable after 120 seconds");
}

const stories = await getVrtStories();
const viewports = Object.values(responsiveViewports);

for (const story of stories) {
  for (const viewport of viewports) {
    test(`${story.id} / ${viewport.name}`, async ({ page }) => {
      await captureStory(page, story, viewport);
    });
  }
}
