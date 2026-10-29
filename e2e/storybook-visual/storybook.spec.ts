import { expect, test } from "@playwright/test"
import { responsiveViewports } from "../../.storybook/responsiveViewports"

type StoryEntry = { id: string; type: string; tags?: string[] }
type StoryIndex = { entries: Record<string, StoryEntry> }

// StorybookのCanvasのみを撮影する（vrtタグでOpt-in）。
// 全対象Storyに対しCompact / Medium / Wideを固定の代表幅で撮影する。
// vrt-modalタグはPortal上のDialogの可視性確認にのみ使用する。
const viewports = [
  responsiveViewports.compact,
  responsiveViewports.medium,
  responsiveViewports.wide,
] as const

test("Storybook visual snapshots", async ({ page, request }) => {
  // 全VRT対象Story × 3領域を1テストで撮影するため、既定の30秒では不足する。
  test.setTimeout(180_000)
  const response = await request.get("/index.json")
  expect(response.ok()).toBeTruthy()
  const index = (await response.json()) as StoryIndex
  const stories = Object.values(index.entries)
    .filter((entry) => entry.type === "story" && entry.tags?.includes("vrt"))
    .sort((a, b) => a.id.localeCompare(b.id))

  expect(stories.length).toBeGreaterThan(0)

  for (const story of stories) {
    for (const viewport of viewports) {
      await test.step(`${story.id} / ${viewport.name}`, async () => {
        await page.setViewportSize({ width: viewport.width, height: viewport.height })
        await page.goto(`/iframe.html?id=${encodeURIComponent(story.id)}&viewMode=story`)
        // Storybook's root must exist, but it need not be visible when a story
        // renders its content into a Portal (for example Mantine Modal).
        await expect(page.locator("#storybook-root")).toBeAttached()

        // Verify the visible capture target separately from the Storybook mount point.
        // Modal stories must prove that the actual modal content is visible.
        if (story.tags?.includes("vrt-modal")) {
          const dialog = page.getByRole("dialog")
          await expect(dialog).toBeVisible()

          // Diagnose centering separately from full-page screenshot framing.
          // Log computed geometry without changing the image capture contract.
          const geometry = await dialog.evaluate((element) => {
            const rect = element.getBoundingClientRect()
            return {
              viewport: { width: window.innerWidth, height: window.innerHeight },
              documentHeight: document.documentElement.scrollHeight,
              modal: { x: rect.x, y: rect.y, width: rect.width, height: rect.height },
              offsetX: rect.left + rect.width / 2 - window.innerWidth / 2,
              offsetY: rect.top + rect.height / 2 - window.innerHeight / 2,
            }
          })
          console.log(`[VRT Modal geometry] ${story.id} / ${viewport.name}: ${JSON.stringify(geometry)}`)
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
