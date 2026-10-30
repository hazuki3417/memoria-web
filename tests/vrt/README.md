# Storybook VRT

StorybookのCanvasをPlaywrightで撮影し、Git管理の基準画像と比較します。MDXのDocsは対象外です。シナリオE2Eとは独立した環境で、既存Quality Gateには組み込まず、Phase 1では独立したCompose動作確認用のGitHub Actionsを利用します。

## VRT実行構造（Issue #223 最新方針）

通常の `tests/vrt/storybook.spec.mts` でStorybook Indexの準備を待ち、`vrt` 対象Storyを収集する。各Story × 固定3Viewportについて独立した `test()` を登録し、`capture.ts` で撮影・比較する。Spec生成用Runnerは廃止する。

旧Baseline 120件は内容を変更せず `tests/vrt/baselines/` に復元済み。旧ファイル名を維持し、比較を通して再利用を確認する。実行検証は未実施。

方針の正本は `memoria-design/content/system/web/frontend-testing.mdx`、本書は実装固有の操作手順を所有する。

## 実行

```bash
npm ci
npx playwright install chromium
npm run test:visual:update
npm run test:visual
```

Storybookはテスト起動時に自動起動します。基準画像は `tests/vrt/__screenshots__` に保存し、表示変更の意図を確認したうえでコミットしてください。

`index.json` の `type: story` のうち、`vrt` タグが明示的に付いたStoryだけを撮影します（Opt-in方式）。すべてのVRT対象Storyを、固定の **Compact (375×812)、Medium (1024×768)、Wide (1440×900)** の3幅で撮影します。Storyごとの撮影幅設定は設けません。代表値の定義は `.storybook/responsiveViewports.ts` に置きます。正式な分類境界は Compact: 768px未満 / Medium: 768px以上1408px未満 / Wide: 1408px以上です。代表撮影幅はレイアウト切替点を意味しません。 `vrt-modal` タグはPortal上のModalの可視性確認にのみ使用します。

旧2幅構成の`desktop`/`mobile` Baselineは廃止し、**3幅Baselineは復元した画像を使って比較**します。既存の3幅Baselineを復元して再利用します。差分がある場合のみ確認し、意図した変更以外は更新しません。候補生成には[Issue #147](https://github.com/hazuki3417/memoria-web/issues/147)のワークフローを用い、画像確認後に承認されたもののみ反映します。

Storybook画面内のViewportアドオンは今回導入しません（後続Issue #216）。手動Visual Reviewでは `iframe.html` を直接開き、ブラウザの開発者ツールで対象幅へ変更します。

画面幅、時刻、乱数、外部API、アニメーション、画像などの安定化が必要なStoryは、再現可能なfixtureやmockをStory側に用意します。テストはフォント・画像読み込みを待ち、アニメーションを無効化します。環境依存の差分を防ぐため、基準画像は同一のOS・ブラウザ・フォント環境で作成・比較してください。

**3幅構成の候補画像生成・実行成功は未検証です。** 承認済みBaselineが登録されるまで比較テストは成功しません。

## Storybook Canvasのレイアウト規則

Storybook公式の[Story layout](https://storybook.js.org/docs/configure/story-layout)に従い、`.storybook/preview.tsx`の既定を`layout: "padded"`と明記する。これはStorybook標準の既定値と同じであり、単体Componentの従来の表示余白を維持する。単体表示で独自のDecoratorやComponent内部にプレビュー専用の余白を追加しない。

- **Component単体**：`padded`を既定とする。必要ならStory単位で`centered`を使う。
- **ページ / ApplicationShell**：Canvas全体を表示基準とするため、metaで`layout: "fullscreen"`を明示する。
- **Dialog / Modal等のViewport基準Overlay**：Portal / fixed配置の基準がStorybookのpadded Canvasにずれないよう、metaで`layout: "fullscreen"`を明示する。
- **既存のVisual / Behavioral Contract**：Storyの`args`、操作、Portalの挙動、Responsive表示は変更しない。Storyの用途に応じた表示基準のみ設定する。

DecoratorはThemeProviderやApplicationShellのfixture、Modal用Portal root等のアプリ固有のContextを提供する責務に限定する。Storybook標準の`layout`を置き換えるための余白Decoratorは導入しない。VRTはStoryの`layout`設定とは独立し、全`vrt` StoryをCompact / Medium / Wideの固定3幅で撮影する。

今回の変更で既存Baselineが変わり得るため、実際の変更が意図したCanvas基準の補正に限られるか候補画像をHuman Visual Reviewで確認し、承認前に自動マージしない。Modalについては座標診断で水平方向の中心ずれが0px付近へ戻ることも確認する。

## 撮影Viewportの共通設定

VRTのViewportは `tests/vrt/storybook.spec.mts` でテスト単位ごとに設定する。代表値は `.storybook/responsiveViewports.ts` を参照する。設定はStoryの `parameters` やDecorator、StorybookのViewportアドオンに依存しない。 `page.setViewportSize()` によりブラウザViewportを変更した後、同じStoryの `iframe.html` を開いて撮影する。

撮影ファイル名のSuffixは `compact`、`medium`、`wide` とする。旧 `mobile` / `desktop` 名のBaselineとの併存・再利用は行わず、候補画像のVisual Review後に全3幅のBaselineを生成する。 `vrt` は撮影対象選定、`vrt-modal` はPortal上のDialogの可視性確認に限る。

## 撮影前の表示確認（Portalを含む）

VRTはStorybookのCanvasを `iframe.html` で読み込む。まず `#storybook-root` がDOMに存在することを `toBeAttached()` で確認し、その後に**撮影対象自体の可視性**を確認する。RootのDOM上の存在と撮影対象の可視性は別の条件として扱う。

- 通常のStoryでは従来どおり `#storybook-root` の `toBeVisible()` を確認する。これは最小限の表示確認であり、非同期データ取得や `play` の完了を保証するものではない。
- Mantine `Modal` 等、Portal上にModalを描画するStoryには `tags: ["visual", "vrt", "vrt-modal"]` を明示する。この場合は `#storybook-root` 自身の可視性を要求せず、`getByRole("dialog").toBeVisible()` を確認する。Portalが `document.body` 直下のどの位置に挿入されても要素の役割から判定できる。
- `vrt-modal` は**可視性確認方法を選ぶ補助タグ**であり、撮影対象に含めるための `vrt` タグを代替しない。追加のPortal型UI（Popover / Tooltip等）は、そのUIに適した確認方法を個別に設計する。単にRootの存在だけを成功条件に緩めない。
- フォント・画像読み込みの待機、スクリーンショットの比較と、Baseline更新の承認フローは変更しない。撮影前の可視性確認が通過しても、実際の描画品質は候補画像でレビューする。

## Docker Composeでの撮影（Phase 1）

`compose.yaml`の`vrt`サービスは`profiles: [vrt]`により通常の`docker compose up`では起動しない。**常駐サービスではなくone-shot**として`docker compose run --rm`で実行し、終了時にコンテナを削除する。Storybookの起動・停止はPlaywright設定のwebServerが担当する。

```bash
# 通常比較（Baselineを変更しない）
docker compose --profile vrt run --rm vrt

# Baseline初回生成・意図した変更時の明示更新
docker compose --profile vrt run --rm -e VRT_UPDATE=1 vrt

# HTML Reportの確認
npm run test:visual:report
```

公式Playwright Dockerイメージ`mcr.microsoft.com/playwright:v1.62.1-noble`を共通利用する。環境変数`MEMORIA_VRT_IMAGE`でイメージを上書きできるが、生成と比較では同一イメージを指定する。タグはまだdigest未固定であり、実機検証後に固定する。Playwrightはlockfileの`1.62.1`を要求し、Node.js 24との互換性を撮影前に検査する。公式イメージのNode.js 24対応は未確認であり、不一致の場合は**撮影を開始せず失敗する**。専用イメージの必要性は結果を踏まえ再協議する。

Composeはソースをbind mountし、Linux用依存関係をnamed volume`vrt-node-modules`へ分離する。one-shot起動ごとに`npm ci`を実行し、依存状態をlockfileに合わせる。公式Playwrightイメージのデフォルトユーザー（root）で実行し、初期状態でroot所有のnamed volumeへ`npm ci`を書き込めるようにする。これは初回CIで発生した`EACCES`への暫定対応であり、bind mount先に生成されるBaselineやレポートがroot所有になる可能性がある。実運用前にファイル所有権と非root化を検討する。Linux/WSL2での動作、フォント・画像一致、Baselineの再現性、実際のテスト成功はいずれも未検証。PR上の動作確認専用Workflow（`.github/workflows/vrt-compose.yml`）を追加する。これはCompose設定・実行環境と通常比較を検証し、Baselineを更新・コミットしない。承認済みBaselineが存在しない間、比較は失敗する可能性があるため、環境構築の失敗とBaseline未登録を区別する。通常のQuality Gateへの統合・必須チェック化は後続Phaseで判断する。

## GitHub Actionsで候補Baselineを生成する

`.github/workflows/vrt-compose.yml`はPR時に**比較のみ**を行う。Baselineの初回生成・明示更新は`workflow_dispatch`の`mode: generate`を選択して手動実行する。このモードも同じComposeサービスを使い、`VRT_UPDATE=1`で候補画像を生成する。候補画像は**`vrt-candidate-baselines-unapproved` Artifact**（14日間保持）として提供し、Gitへの自動コミットやBaselineの自動承認は行わない。通常比較・候補生成とも診断情報は`vrt-compose-diagnostics`に保存する。

GitHubの「Actions」→「VRT Docker Compose smoke test」→「Run workflow」で対象branchを選び、`mode: generate`を選択する。**GitHubの手動実行UIはworkflow定義がデフォルトブランチに存在する必要がある**ため、このPRが未マージの間は手動実行を利用できない場合がある。PRの自動実行は比較のみであり、Baseline未登録の失敗は想定どおりとする。

生成Artifactを取得してVRT対象Story×3領域の画像を設計と照合し、レビューを通過した画像だけを`tests/vrt/baselines/`に登録する。その後`mode: compare`またはPR比較で成功を確認する。Artifactの取得だけではBaseline承認やGit反映は完了しない。**候補画像を自動的にコミットしない。**

## Issue・GitHubプラグインからのBaseline生成PR依頼

[Issue #147](https://github.com/hazuki3417/memoria-web/issues/147)に、リポジトリのOWNER/MEMBER/COLLABORATORが次の形式で**新規コメント**を投稿すると、Baseline候補PR生成Workflowを起動する。

```text
/vrt baseline feature/group-browser
```

GitHubプラグイン経由でも、明示された対象ブランチを用いて同じIssueへコメントすれば依頼できる。Workflow（`.github/workflows/vrt-baseline-request.yml`）はGitHub Actionsの`issue_comment`を利用するため、**Workflowがデフォルトブランチにマージされるまではコメントで起動できない**。手動の`workflow_dispatch`には`target_branch`を指定する。

対象ブランチの最新コミットを読み取り専用ジョブでDocker撮影し、候補画像をArtifactへ保存。別の書き込み権限付きジョブが**画像だけ**を`chore/vrt-baseline-<branch-hash>`へコミットし、対象ブランチ宛てのPRを作成・更新する。撮影時点から対象ブランチが変わった場合はエラーにして再依頼する。同一対象への再実行では既存の未マージPRを使用し、自動生成専用ブランチを`--force-with-lease`で安全に置き換える（レビュー済み画像に差分が再発するため再レビュー必須）。差分がなければ新規コミットを作らない。PR承認・マージは**人間のみ**が実行する。

このPR方式は既存のArtifactによる手動候補生成モードと区別する。Issueコメントへの依頼は任意のIssueではなく#147だけに限定する。GitHub Actionsのリポジトリ権限設定により`GITHUB_TOKEN`からPRを作成できない場合は、設定を確認するまで成功扱いしない。`GITHUB_TOKEN`で作成・更新したPRは通常のPRイベントWorkflowを自動起動しない場合があるので、必要なテストは別途確認する。

## Baseline作成・比較・承認フロー（Phase 1）

Baselineの生成・更新と、通常の比較実行は**異なる操作**です。通常比較でBaselineを自動更新してはいけません。

1. `vrt`タグ付きStoryを選定し、表示状態・Viewport・Fixtureが再現可能であることを確認する。
2. 固定した実行環境で `npm run test:visual:update` を**明示的に**実行し、新規Baselineを生成する（既存Baselineは復元済み。更新が必要なときに限りGit差分を確認する）。
3. Gitの画像差分と画面設計を照合し、意図した表示であることをレビューする。生成できただけでは承認済みにならない。
4. 承認したBaselineをGitへ登録し、`npm run test:visual` で通常比較を行う。
5. 通常の画面変更では比較のみを行い、差分が意図したものと確認された場合に限ってBaselineを明示的に再生成・レビュー・更新する。

```bash
npm ci
npx playwright install chromium
# 新規導入・意図した画面変更時だけ明示的に実行
npm run test:visual:update
# 通常比較（Baselineを変更しない）
npm run test:visual
# 失敗時のHTML reportを開く
npm run test:visual:report
```

**Dockerイメージ方針（合意済み）**: Phase 1ではMemoria専用イメージ・GHCR配布を導入せず、Microsoft公式Playwright DockerイメージをBaseline生成・比較で共通利用する。将来のCIでも同じイメージを使用する。特定のPlaywrightバージョンに対応する固定タグと、検証後はdigestでの固定を基本とする。リポジトリのNode.js 24要求を満たすか、コンテナ内の日本語フォント・Chromium・権限・描画が一致するかは**未検証**であり、適合確認前に公式イメージをそのまま利用可能と断定しない。もし満たせなければ、専用イメージ化の必要性を再協議する。イメージ更新時には既存Baselineでの比較・差分確認を行い、Baseline更新とは別にレビューする。

**共通撮影環境**: Playwright / Chromium、OS、フォント、DPR、Locale、Viewportを揃える。現状のPlaywright設定はDesktop Chrome、DPR=1、ja-JP、light、375×812 / 1024×768 / 1440×900の3幅を指定しているが、OS・フォントの固定コンテナは未導入である。異なる環境で撮影したBaselineの差分をUI回帰と断定しない。基準画像生成および実行成功は未検証であり、安定化と共通実行環境の検証はPhase 1の未完了作業とする。

**失敗時**はPlaywrightのHTML ReportとExpected / Actual / Diff画像を確認し、原因を調査する。Baseline欠落は未登録として扱い、通常比較から更新処理を呼ばない。 `play`付きStoryの撮影同期は未実装のため、対象に追加する前に完了待機・描画安定を検証する。

**CI / Quality Gate**: Compose検証用Workflowだけを追加し、既存Quality Gateには組み込まない。旧VRT実装のnpmコマンドは削除済み。旧単一テストと設定は新構成に置き換え済み。

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
