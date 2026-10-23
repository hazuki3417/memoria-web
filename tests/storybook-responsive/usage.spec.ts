import { expect, test } from "@playwright/test"
import { mkdir } from "node:fs/promises"
import { join } from "node:path"

// StorybookでProductionと共通の画面UIを3つの実ブラウザ幅で描画する。
// E2EフローでもSnapshot VRTでもない。画像はVisual Review用の未承認Artifact。
const viewports = [
  { name: "wide", width: 1440, height: 900 },
  { name: "medium", width: 900, height: 800 },
  { name: "compact", width: 375, height: 812 },
] as const

for (const viewport of viewports) {
  test(`Usage responsive preview / ${viewport.name}`, async ({ page }) => {
    await page.setViewportSize({ width: viewport.width, height: viewport.height })
    await page.goto("/iframe.html?id=design-prototypes-settings-usage--default&viewMode=story")
    await expect(page.getByRole("heading", { name: "利用状況" })).toBeVisible()

    // 視覚の最終判断は画像を人間がReviewする。テスト成功をVisual Approvalとは扱わない。
    await page.evaluate(async () => {
      await document.fonts.ready
    })
    const imageDir = "tests/storybook-responsive/screenshots"
    await mkdir(imageDir, { recursive: true })
    await page.screenshot({
      path: join(imageDir, `usage-${viewport.name}.png`),
      fullPage: true,
      animations: "disabled",
    })

    for (const label of ["使用済み", "空き容量", "総容量", "ファイル形式別内訳"]) {
      await expect(page.getByText(label, { exact: true })).toBeVisible()
    }
    const table = page.getByRole("table")
    await expect(table.getByRole("columnheader")).toHaveCount(4)
    for (const format of ["JPEG", "PNG", "WebP", "HEIC / HEIF"]) {
      await expect(table.getByRole("cell", { name: format, exact: true })).toBeVisible()
    }
    await expect(table.getByText("1,248 件")).toBeVisible()
    for (const label of ["形式", "登録件数", "使用量", "割合"]) {
      await expect(table.getByRole("button", { name: `${label}で並べ替え` })).toBeEnabled()
    }

    // 意味的な画面幅の判定を実ブラウザviewportに照らして確認する。
    const isCompact = await page.evaluate(
      () => window.matchMedia("(max-width: 48em)").matches,
    )
    expect(isCompact).toBe(viewport.name === "compact")
    if (isCompact) {
      await expect(page.getByRole("combobox", { name: "設定画面" })).toBeVisible()
    } else {
      await expect(page.getByRole("navigation", { name: "設定" })).toBeVisible()
    }
  })
}
