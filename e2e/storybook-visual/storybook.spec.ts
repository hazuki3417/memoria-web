import { expect, test } from "@playwright/test"
import { responsiveViewports } from "../../.storybook/responsiveViewports"

type StoryEntry = { id: string; type: string; tags?: string[]; parameters?: Record<string, unknown> }
type StoryIndex = { entries: Record<string, StoryEntry> }

// StorybookのCanvasのみを対象とする。Docs/MDXは撮影しない。
// 撮影対象はStory側でvrtタグを明示したものに限定する。
// @see https://storybook.js.org/docs/writing-stories/tags
// Preserve existing screenshot filenames for all established VRT targets.
const viewports = [
  { name: "desktop", width: responsiveViewports.wide.width, height: responsiveViewports.wide.height },
  { name: "mobile", width: responsiveViewports.compact.width, height: responsiveViewports.compact.height },
] as const

// The new Modal is reviewed in all three adopted responsive regions.
const mediumViewport = { name: "medium", width: responsiveViewports.medium.width, height: responsiveViewports.medium.height } as const

test("Storybook visual snapshots", async ({ page, request }) => {
  // 全VRT対象Story × Desktop/Mobileを1テストで撮影するため、既定の30秒では不足する。
  test.setTimeout(180_000)
  const response = await request.get("/index.json")
  expect(response.ok()).toBeTruthy()
  const index = (await response.json()) as StoryIndex
  const stories = Object.values(index.entries)
    .filter((entry) => entry.type === "story" && entry.tags?.includes("vrt"))
    .sort((a, b) => a.id.localeCompare(b.id))

  expect(stories.length).toBeGreaterThan(0)

  for (const story of stories) {
    const captureViewports = story.tags?.includes("vrt-modal") ? [...viewports, mediumViewport] : viewports
    for (const viewport of captureViewports) {
      await test.step(`${story.id} / ${viewport.name}`, async () => {
        await page.setViewportSize({ width: viewport.width, height: viewport.height })
        await page.goto(`/iframe.html?id=${encodeURIComponent(story.id)}&viewMode=story`)
        // Storybook's root must exist, but it need not be visible when a story
        // renders its content into a Portal (for example Mantine Modal).
        await expect(page.locator("#storybook-root")).toBeAttached()

        // Verify the visible capture target separately from the Storybook mount point.
        // Modal stories must prove that the actual modal content is visible.
        if (story.tags?.includes("vrt-modal")) {
          await expect(page.getByRole("dialog")).toBeVisible()
        } else {
          await expect(page.locator("#storybook-root")).toBeVisible()
        }
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
