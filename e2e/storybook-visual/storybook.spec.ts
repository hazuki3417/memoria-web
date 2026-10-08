import { expect, test } from "@playwright/test"

type StoryEntry = { id: string; type: string; tags?: string[]; parameters?: Record<string, unknown> }
type StoryIndex = { entries: Record<string, StoryEntry> }

// StorybookのCanvasのみを対象とする。Docs/MDXは撮影しない。
// 撮影対象の選択はStory側のタグで制御できる。
// @see https://storybook.js.org/docs/writing-stories/tags
const viewports = [
  { name: "desktop", width: 1440, height: 900 },
  { name: "mobile", width: 375, height: 812 },
] as const

test("Storybook visual snapshots", async ({ page, request }) => {
  const response = await request.get("/index.json")
  expect(response.ok()).toBeTruthy()
  const index = (await response.json()) as StoryIndex
  const stories = Object.values(index.entries)
    .filter((entry) => entry.type === "story" && !entry.tags?.includes("no-vrt"))
    .sort((a, b) => a.id.localeCompare(b.id))

  expect(stories.length).toBeGreaterThan(0)

  for (const story of stories) {
    for (const viewport of viewports) {
      await test.step(`${story.id} / ${viewport.name}`, async () => {
        await page.setViewportSize({ width: viewport.width, height: viewport.height })
        await page.goto(`/iframe.html?id=${encodeURIComponent(story.id)}&viewMode=story`)
        await expect(page.locator("#storybook-root")).toBeVisible()
        await page.evaluate(async () => {
          await document.fonts.ready
          await Promise.all(
            Array.from(document.images).map(async (img) => {
              if (img.complete) return
              await new Promise<void>((resolve) => {
                img.addEventListener("load", () => resolve(), { once: true })
                img.addEventListener("error", () => resolve(), { once: true })
              })
            }),
          )
        })
        await expect(page).toHaveScreenshot(`${story.id}--${viewport.name}.png`, {
          animations: "disabled",
          caret: "hide",
          fullPage: true,
        })
      })
    }
  }
})
