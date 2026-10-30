import { expect, type Page } from "@playwright/test";

type Story = { id: string; tags?: string[] };
type Viewport = { name: string; width: number; height: number };

// Keep the approved screenshot names and capture contract during test restructuring.
export async function captureStory(page: Page, story: Story, viewport: Viewport) {
  await page.setViewportSize({ width: viewport.width, height: viewport.height });
  await page.goto(`/iframe.html?id=${encodeURIComponent(story.id)}&viewMode=story`);
  await expect(page.locator("#storybook-root")).toBeAttached();

  if (story.tags?.includes("vrt-modal") || story.tags?.includes("vrt-drawer")) {
    await expect(page.getByRole("dialog")).toBeVisible();
  } else if (story.tags?.includes("vrt-menu")) {
    await expect(page.getByRole("menu")).toBeVisible();
  } else {
    await expect(page.locator("#storybook-root")).toBeVisible();
  }

  await page.evaluate(async () => {
    await document.fonts.ready;
    await Promise.all(Array.from(document.images).map(async (img) => {
      if (img.complete) return;
      await new Promise<void>((resolve) => {
        img.addEventListener("load", () => resolve(), { once: true });
        img.addEventListener("error", () => resolve(), { once: true });
      });
    }));
  });
  await expect(page).toHaveScreenshot(`${story.id}--${viewport.name}.png`, {
    animations: "disabled", caret: "hide", fullPage: true,
  });
}
