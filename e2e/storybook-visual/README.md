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

`index.json` の `type: story` のうち、`vrt` タグが明示的に付いたStoryだけを撮影します（Opt-in方式）。Storyを追加するだけではVRT対象になりません。初期対象としてDashboard Prototypeの`Personal`と`Empty`にタグを指定しています。初期構成ではdesktop (1440×900) とmobile (375×812) を撮影します。必要に応じて対象画面幅とStoryを調整します。

画面幅、時刻、乱数、外部API、アニメーション、画像などの安定化が必要なStoryは、再現可能なfixtureやmockをStory側に用意します。テストはフォント・画像読み込みを待ち、アニメーションを無効化します。環境依存の差分を防ぐため、基準画像は同一のOS・ブラウザ・フォント環境で作成・比較してください。

**現時点では基準画像の生成と実行成功は未検証です。** 基準画像がない状態では比較テストは成功しません。

## VRT対象Storyの指定

Story単位で `tags: ["vrt"]` を付けたStoryを撮影する。`vrt`は本プロジェクト独自の識別タグであり、Storybook自体に撮影機能を追加するものではない。インタラクション用Storyには原則付けないが、`play`完了後の視覚検証が必要な場合は例外とする。

```tsx
export const Default: Story = {
  tags: ["vrt"],
  args: { initialState: "default" },
}
```

撮影対象を選ぶ際は、基本状態、空状態、ダイアログなど、見た目の回帰を検出したい代表的な表示状態を優先する。`parameters`は将来的な撮影個別設定に用い、対象の選択には使わない。

## StoryとVRTの責務分担（設計方針）

StorybookはUI状態の確認とインタラクションテストの両方に利用する。Storyが存在することと、VRTの撮影対象であることは分離して考える。

- 通常のUI状態確認用Storyは、原則として`play`による自動操作を伴わず、静止した状態を表示する。
- インタラクションテスト用Storyでは`play`による自動操作を許容する。原則としてVRTの撮影対象から除外する。
- 操作後の表示状態に視覚的な検証価値があり、撮影前に`play`の完了と描画の安定を保証できる場合は、インタラクションStoryをVRTと兼用してもよい。
- VRTではStoryごとの撮影適性を判断し、対象を明示的に管理する。単に`play`の有無だけで可否を判断しない。
- 既存のStoryやコンポーネントの表示・振る舞いを維持し、テスト都合だけで不要なpropsや状態を追加しない。

### 現在の実装との差分・今後の検討事項

Playwrightテストは、`index.json`上で`vrt`タグ付きのStoryのみを対象とする。Story単位の明示指定を基本とし、大部分がVRT対象となる場合のみMeta単位での指定を検討する。タグの付け忘れによるカバレッジ不足はレビューで確認する。また、フォント・画像の読み込み待機はあるが、`play`の完了を明示的に待つ仕組みはない。したがって本節は運用上の設計方針を定めるもので、`play`完了・非同期描画の安定化の実装完了を意味しない。VRT導入時にこれらの待機方法を設計・検証する。
