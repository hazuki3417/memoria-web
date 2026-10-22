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

## StoryとVRTの責務分担（設計方針）

StorybookはUI状態の確認とインタラクションテストの両方に利用する。Storyが存在することと、VRTの撮影対象であることは分離して考える。

- 通常のUI状態確認用Storyは、原則として`play`による自動操作を伴わず、静止した状態を表示する。
- インタラクションテスト用Storyでは`play`による自動操作を許容する。原則としてVRTの撮影対象から除外する。
- 操作後の表示状態に視覚的な検証価値があり、撮影前に`play`の完了と描画の安定を保証できる場合は、インタラクションStoryをVRTと兼用してもよい。
- VRTではStoryごとの撮影適性を判断し、対象を明示的に管理する。単に`play`の有無だけで可否を判断しない。
- 既存のStoryやコンポーネントの表示・振る舞いを維持し、テスト都合だけで不要なpropsや状態を追加しない。

### 現在の実装との差分・今後の検討事項

現状のPlaywrightテストは、`index.json`上の全Storyから`no-vrt`タグ付きのStoryを除外する方式であり、撮影対象を明示的に選ぶ方式ではない。また、フォント・画像の読み込み待機はあるが、`play`の完了を明示的に待つ仕組みはない。したがって本節は運用上の設計方針を定めるもので、VRTの撮影選択・同期待機の実装完了を意味しない。VRT導入時に、対象の明示的管理方法と`play`完了・非同期描画の安定化方法を設計・検証する。
