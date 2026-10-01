# AGENTS.md

## リポジトリの責務

このリポジトリはMemoriaのWebアプリケーションです。Memoriaは以下のリポジトリで構成される一つのプロダクトです。

- `memoria-web`: このNext.jsアプリケーション
- `memoria-api`: Go GraphQL APIと永続化ロジック
- `memoria-design`: プロダクト用語とリポジトリ横断設計
- `memoria-IaC`: AWS CDKによるインフラストラクチャ

プロダクト全体の設計上の正本は`memoria-design`です。資料、リポジトリ内のGraphQLスキーマ、実際のAPI挙動が一致しない場合は差異を報告してください。

## 開発プロセスとFeedback

- MemoriaはGoalを単位とするイテレーション型のアジャイル開発を採用します。正本は`memoria-design/pages/development-process.mdx`です。
- 開発頻度が不定期であるため固定期間を設けず、イテレーションIssueへGoal、対象、対象外、Checkpoint、Review、振り返りを記載します。3イテレーション完了後に運用を見直します。
- 機能単位で要求を合意して設計・実装へ進み、すべての要求完了を待つ一括工程にはしません。
- 大規模機能は利用者価値または独立して検証できる境界でPhaseへ分割し、工程別Phase、長期Feature branch、巨大PRを前提にしません。中断時は再開に必要なCheckpointをIssueへ記録します。
- AIは人間の提案へ受動的に同意せず、妥当性、前提、risk、既存設計との矛盾、過剰設計を評価します。
- 懸念がある場合は変更前に指摘し、代替案、trade-off、推奨案を示します。詳細は`memoria-design/pages/ai-development.mdx`を参照します。
- 複数の論点は番号を付けて一つずつ扱い、回答後に合意、前提、影響範囲、制限、未決定事項を整理します。

## ブランチ運用

- `main`は本番リリース可能な安定版を表します。通常の開発作業や直接pushは行いません。
- `develop`は日常開発の統合先であり、このリポジトリの既定ブランチとして扱います。
- `feature/*`、`fix/*`、`docs/*`、`refactor/*`、`chore/*`は最新の`develop`から作成し、PRのbaseを`develop`にします。
- 通常リリースは`develop`から`main`へのPRで行い、人間が差分と検証結果を確認して承認します。
- 緊急修正の`hotfix/*`だけは`main`から作成し、`main`への反映後に同じ修正を`develop`へ同期します。
- `master`は使用しません。存在する場合は`main`との差分を確認して`main`へ統合した後、参照や未完了PRがないことを確認して廃止します。
- ステージング・テスト専用ブランチは設けません。必要になった環境はブランチではなくデプロイ設定で分離します。
- 詳細な共通規約は`memoria-design/pages/branch-strategy.mdx`を参照します。
- PRは原則として通常の状態で作成し、Draftは人間が明示的に指示した場合だけ使用します。
- 通常PRは受け入れ条件と必要な検証を満たし、レビュー可能な状態で作成します。
- PRのマージには、原則として通常のmerge commitを使用します。squash mergeまたはrebase mergeは、明示的な理由と合意がある場合だけ使用します。
- 作業ブランチへ派生元の更新を取り込む場合は、原則としてrebaseを使用します。`develop`を作業ブランチへmergeしません。
- rebase後にリモートの作業ブランチを更新する必要がある場合は、本人だけが使用するブランチであることを確認し、`--force-with-lease`を使用します。
- 共有ブランチである`main`と`develop`はrebaseまたはforce pushしません。

## アプリケーション境界

Application Architectureの正本は `memoria-design/content/system/web/implementation-conventions.mdx` です。目標構成は `src/app`、`src/features`、`src/ui`、`src/infrastructure` をownership boundaryとして使用します。

既存の `src/components`、`src/feature`、`src/providers`、`src/graphql`、`src/lib` 等は旧構成を含みます。存在していることだけを理由に新規実装の配置規則とはみなしません。一括移行は行わず、変更対象ごとに正本Architectureへ適合させる範囲を判断します。

- `src/app` はNext.jsのentry、routing、layout等を担当し、Product/Application Logicを蓄積しません。
- Product Capabilityは `src/features` をownerとし、Feature間の直接依存を原則として避けます。
- Feature非依存のMemoria UI / Pattern実装は `src/ui` が所有します。再利用されるだけではFeature Componentを移動しません。
- GraphQL Client等の外部Integrationは `src/infrastructure` が所有します。
- Product FeatureのGraphQL Remote StateはClient Apolloをdefaultとし、Server QueryはServer固有の明確な責務がある場合に利用します。
- ComponentとPure Product/Application LogicへApolloやGenerated GraphQL Typeを漏らしません。
- Reactを必要としない判断、変換、Validation、State Transition、Derived StateはPure TypeScriptを優先します。
- `shared` / `common` や、Code形態だけを表すTop-level `utils` / `hooks` / `types` 等を新しい標準境界として追加しません。
- サーバー専用の環境変数や認証情報を、Client Componentやブラウザ向けbundleへ含めません。
- 認証済みルートと公開ルートの境界を維持します。

## ドキュメント

- プロダクト設計、画面・コンポーネント設計、横断的な判断の正本は`memoria-design`です。
- このリポジトリにはREADME、実行コマンド、GraphQL operation・fragment・生成設定など、実装に密着した情報を置きます。
- 設計内容をこのリポジトリへ複製せず、正本へのリンクと実装上の参照先だけを記載します。
- AI contextは`memoria-design/pages/context/`を索引として使用し、タスク固有の要件はIssueへ記録します。
- 資料、クライアントschema、APIの実際の挙動が一致しない場合は差異を報告します。

## ローカル開発環境

標準環境はWindowsホスト、WSL2 Ubuntu、VS Code、Devboxです。Node.js 24を含むDevboxを使用します。共通方針は`memoria-design/pages/local-development.mdx`を参照します。

- リポジトリはUbuntu側で開き、npm・Node.jsなどのプロジェクトコマンドはUbuntu上のDevbox内で実行します。
- Windowsホストから直接プロジェクトコマンドを実行しません。
- `node_modules`をOS間でコピーまたは共有せず、npmパッケージは`package.json`とlockfileへ記録します。
- APIとの結合確認では、`memoria-api`を別のWSLターミナルとDevboxで起動し、Windowsのブラウザから`localhost`へアクセスします。

```sh
devbox shell
npm ci
npm run dev:next
```

Storybookは`npm run dev:storybook`で起動します。シークレット、ローカル環境ファイル、Playwrightレポート、build生成物をコミットしません。

## 検証

GitHub Actionsの`quality / web`はPull Requestと`develop`・`main`へのpushで、`npm ci`、GraphQL client生成、Biome、TypeScript、Vitest、Next.js buildを実行します。Node.jsのversionは`package.json`の`engines.node`を正本とします。

Biomeは既存コード全体の違反によって新しい変更を停止させないため、比較元commitから変更されたTypeScript fileだけを段階的に検査します。TypeScript、Vitest、Next.js buildはプロジェクト全体を対象とします。

人間がローカル開発環境で同じ検証を再現する場合:

```sh
npm ci
npm run quality
```

各検証を個別に確認する場合:

```sh
npm run gen:graphql
npm run check
npm run typecheck
npm run test:unit
npm run build
```

GraphQL生成物はGit管理対象外のため、clean checkoutでは型検査とbuildの前に生成します。ChatGPTの実行環境ではbuild、test、静的解析、構文検証を実行せず、GitHub Actionsへ委譲します。

表示や操作を変更する場合は、関連する検証も実行します。

```sh
npm run build:storybook
npm run test:vrt
npm run test:app
```

表示差分を確認せずに、テストを通す目的だけでVisual Regression Testのsnapshotを更新しません。

## GraphQL開発手順

- `src/graphql/schema`のクライアントスキーマは、`memoria-api/schemas/graphql`が所有するAPI契約を反映します。
- 現行構成ではoperation / fragmentを変更してから`npm run gen:graphql`を実行します。Feature近接配置への移行はArchitecture正本と実装Issueに従います。
- GraphQL生成物はGit管理対象外です。clean checkoutでも生成可能な状態を維持し、生成物を直接編集しません。
- 目標構成ではAPI schema mirrorを`src/infrastructure/graphql/schema`、生成物を`src/infrastructure/graphql/generated`で扱います。実装移行前にREADME・Codegen設定・importを同じ変更で整合させます。
- APIスキーマ変更時は、その契約を提供するAPI側のPRまたはcommitを示し、null許容性、scalar、upload、paginationの意味を確認します。
- 判断を記録せず、API契約の不一致を推測によるクライアント側回避策で隠しません。

## 作業規約

1. 編集前に対象のroute、component・feature、provider、GraphQL operation、テストを確認します。
2. 別のUIシステムを追加する前に、既存のMantine部品とMemoriaの実装パターンを優先します。
3. ユーザー向け文言には`memoria-design/pages/ubiquitous.mdx`のユビキタス言語を使用します。
4. 横断変更が明示されていない限り、変更範囲をこのリポジトリ内に限定します。
5. 横断変更ではリポジトリごとにブランチとPRを分け、契約上の依存関係を相互リンクします。
6. ロジックには単体テスト、重要なUI挙動にはStorybookまたはPlaywrightの検証を追加します。
7. 明示的なセキュリティレビューなしに、認証、Cookie、CSRF、環境変数の公開範囲を変更しません。

## コードレビュー規則

- サーバー側のシークレット、token、未検証の環境変数がブラウザへ公開される変更を指摘します。
- 既存の認証guardを通らずに認証済みデータへアクセスできる変更を指摘します。
- 生成コードが古いGraphQL変更や、API契約への依存が示されていない変更を指摘します。
- ユーザー、画像グループ、pagination connection間でデータが混ざる可能性のあるcache更新を指摘します。
- ファイルサイズ、Content-Type、認可、失敗処理が不足したupload・download処理を指摘します。
- Memoriaのユビキタス言語と一致しないユーザー向け文言を指摘します。
- Storybook・VRTへの対応方針が示されていない表示変更を指摘します。
- Goalとして完了・検証できない巨大Issue、工程別Phase、長期Feature branchを前提とする変更を指摘します。
- Windowsホストからの直接実行、OS間の`node_modules`共有、依存関係の未記録など、標準ローカル環境の再現性を損なう手順を指摘します。
- フォーマットなど機械的に判定できる項目はBiome、TypeScript、テスト、CIへ任せます。
