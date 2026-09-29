import { expect, test } from "@playwright/test";

test("Storybook smoke: index and iframe are available", async ({ page, request }) => {
  const index = await request.get("/index.json");
  expect(index.ok()).toBeTruthy();
  const data = (await index.json()) as {
    entries: Record<string, { id: string; type: string }>;
  };
  const story = Object.values(data.entries).find((entry) => entry.type === "story");
  expect(story, "At least one Storybook story is required").toBeDefined();
  await page.goto(`/iframe.html?id=${story?.id}`);
  await expect(page.locator("#storybook-root")).toBeVisible();
});
