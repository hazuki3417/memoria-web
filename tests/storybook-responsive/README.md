# Usage Responsive Preview（Storybook）

このDirectoryのテストは**Storybook上の共通UI Component**を実ブラウザのWide（1440×900）、Medium（900×800）、Compact（375×812）で確認するものです。実際の認証・API・routeを通すApplication E2Eではなく、承認済み画像と比較するVRTでもありません。

## 実行

```bash
npm ci
npx playwright install chromium
npm run test:responsive
```

PlaywrightがStorybookを起動し、`Design Prototypes/Settings/Usage > Default`をそれぞれのブラウザ幅で描画します。容量・内訳・Navigation・ソート操作の基本contractを検査します。画面はProductionと同じ`SettingsUsage` Componentを使用します。

## 目視確認の手順

`tests/storybook-responsive/screenshots/usage-wide.png`、`usage-medium.png`、`usage-compact.png` を比較します。GitHub Actionsの `CI / Storybook Responsive` はこれらを `usage-responsive-previews-unapproved` Artifactとしてアップロードします。画像は**Visual Review用の候補**であり、Baselineでも自動的なVisual Approvalでもありません。

ローカルStorybookで直接確認する場合は、`npm run dev:storybook` で `Design Prototypes/Settings/Usage > Default` を開き、**Storybook Canvasの実際のブラウザ表示領域**を1440 / 900 / 375pxに変更してください。現在の`parameters.viewport.defaultViewport`はViewport Addonの明示登録がないため、Story上の名前だけで実際の画面幅が設定されたとは扱いません。特にCompact / Mediumの判断にはブラウザの`window.innerWidth`も確認します。

対象:
- 3幅で使用済み・空き容量・上限・内訳4列・全形式行・合計件数が表示される
- Wide / MediumとCompactでSettings Navigationの構成が切り替わる
- 色、折り返し、文字の重なり、余白、左右位置、操作領域が3幅で適切かは人間が画像から判断する

横スクロール全面禁止や独自Breakpointの仕様は、合意なくこのテストへ加えません。Usageの`vrt`タグ追加・Baseline更新はVisual Reviewの承認後に別途判断します。

関連: [Issue #165](https://github.com/hazuki3417/memoria-web/issues/165)、[PR #164](https://github.com/hazuki3417/memoria-web/pull/164)、`memoria-design/content/system/web/usage-test-design.mdx`（UI-01 / UI-02）。
