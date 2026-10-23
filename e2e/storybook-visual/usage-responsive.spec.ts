import { expect, test } from "@playwright/test"

// Usageの既存Storyを本体と同じComponentで確認する。
// VRT Baselineの採用・更新とは独立したResponsive Contract Test。
const viewports = [
  { name: "Wide", width: 1440, height: 900 },
  { name: "Medium", width: 900, height: 800 },
  { name: "Compact", width: 375, height: 812 },
] as const

for (const viewport of viewports) {
  test(`Usage Responsive Contract / ${viewport.name}`, async ({ page }) => {
    await page.setViewportSize({
      width: viewport.width,
      height: viewport.height,
    })
    await page.goto(
      "/iframe.html?id=design-prototypes-settings-usage--default&viewMode=story",
    )

    const heading = page.getByRole("heading", { name: "利用状況" })
    await expect(heading).toBeVisible()
    await expect(page.getByText("使用済み")).toBeVisible()
    await expect(page.getByText("空き容量")).toBeVisible()
    await expect(page.getByText("総容量")).toBeVisible()
    await expect(page.getByText("ファイル形式別内訳")).toBeVisible()

    const table = page.getByRole("table")
    await expect(table).toBeVisible()
    for (const label of ["形式", "登録件数", "使用量", "割合"]) {
      await expect(
        table.getByRole("button", { name: `${label}で並べ替え` }),
      ).toBeEnabled()
    }
    for (const format of ["JPEG", "PNG", "WebP", "HEIC / HEIF"]) {
      await expect(table.getByRole("cell", { name: format })).toBeVisible()
    }
    await expect(table.getByText("1,248 件")).toBeVisible()

    // 横方向に画面全体がはみ出すと一部の内訳を認識しづらくなる。
    // Compactでも表の値を削らず、viewport全体の横スクロールを発生させない。
    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth - window.innerWidth,
    )
    expect(overflow, "document horizontal overflow").toBeLessThanOrEqual(1)

    if (viewport.name === "Compact") {
      await expect(page.getByRole("combobox", { name: "設定画面" })).toBeVisible()
    } else {
      await expect(page.getByRole("navigation", { name: "設定" })).toBeVisible()
    }
  })
}
