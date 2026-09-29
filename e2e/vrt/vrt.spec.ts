import { expect, test } from "@playwright/test";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const data = JSON.parse(
  readFileSync(resolve(process.cwd(), "storybook-static/index.json"), "utf8"),
) as { entries: Record<string, EntryType> };

// storybookのindex.jsonに記述されているentries要素オブジェクトの型定義
type EntryType = {
  type: string;
  id: string;
  name: string;
  title: string;
  importPath: string;
  componentPath: string;
  tags: string[];
};

test.describe("Storybook VRT", () => {
  const entryis: EntryType[] = Object.values(data.entries);
  for (const entry of entryis) {
    test(`${entry.id}`, async ({ page }) => {
      await page.goto(`/iframe.html?id=${entry.id}`);
      await expect(page).toHaveScreenshot(`${entry.id}.png`);
      await page.close();
    });
  }
});
