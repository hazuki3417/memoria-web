import { expect, test } from "@playwright/test"
import { responsiveViewports } from "../../.storybook/responsiveViewports"

type StoryEntry = { id: string; type: string; tags?: string[]; parameters?: Record<string, unknown> }
type StoryIndex = { entries: Record<string, StoryEntry> }

// StorybookのCanvasのみを対象とする。Docs/MDXは撮影しない。
// 撮影対象はStory側でvrtタグを明示したものに限定する。
// @see https://storybook.js.org/docs/writing-stories/tags
// Screenshot filenames for existing baselines must not change.
const captureViewports = {
  wide: { name: "desktop", width: responsiveViewports.wide.width, height: responsiveViewports.wide.height },
  compact: { name: "mobile", width: responsiveViewports.compact.width, height: responsiveViewports.compact.height },
  medium: { name: "medium", width: responsiveViewports.medium.width, height: responsiveViewports.medium.height },
} as const

type CaptureViewport = keyof typeof captureViewports
const defaultViewports: CaptureViewport[] = ["wide", "compact"]

function resolveCaptureViewports(parameterValue: string | null): CaptureViewport[] {
  if (!parameterValue) return defaultViewports
  const values = parameterValue.split(",")
  if (values.length === 0 || new Set(values).size !== values.length) {
    throw new Error(`Invalid VRT viewport configuration: ${parameterValue}`)
  }
  for (const value of values) {
    if (!Object.prototype.hasOwnProperty.call(captureViewports, value)) {
      throw new Error(`Unknown VRT viewport: ${value}`)
    }
  }
  return values as CaptureViewport[]
}

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
    // Storybook's index.json does not include resolved Story parameters.
    // Read the effective parameters from a hidden decorator marker instead.
    await page.goto(`/iframe.html?id=${encodeURIComponent(story.id)}&viewMode=story`)
    const marker = page.locator("[data-vrt-viewports]")
    await expect(marker).toBeAttached()
    const configuredViewports = resolveCaptureViewports(await marker.getAttribute("data-vrt-viewports"))

    for (const viewportName of configuredViewports) {
      const viewport = captureViewports[viewportName]
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
