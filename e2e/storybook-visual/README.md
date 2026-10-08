# Storybook VRT

StorybookのCanvasをPlaywrightで撮影し、Git管理の基準画像と比較します。MDXのDocsは対象外です。既存のVRTとは独立した環境で、Quality GateやCIは追加しません。

## 実行

```bash
npm ci
npx playwright install chromium
npm run test:storybook-visual:update
npm run test:storybook-visual
```

Storybookはテスト起動時に自動起動します。基準画像は `e2e/storybook-visual/__screenshots__` に保存し、表示変更の意図を確認したうえでコミットしてください。

`index.json` の `type: story` のみを対象とし、`no-vrt` タグが付いたStoryは除外します。初期構成ではdesktop (1440×900) とmobile (375×812) を撮影します。必要に応じて対象画面幅とStoryを調整します。

画面幅、時刻、乱数、外部API、アニメーション、画像などの安定化が必要なStoryは、再現可能なfixtureやmockをStory側に用意します。テストはフォント・画像読み込みを待ち、アニメーションを無効化します。環境依存の差分を防ぐため、基準画像は同一のOS・ブラウザ・フォント環境で作成・比較してください。

**現時点では基準画像の生成と実行成功は未検証です。** 基準画像がない状態では比較テストは成功しません。
