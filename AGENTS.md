# AGENTS.md

## リポジトリの責務

このリポジトリはMemoriaのWebアプリケーションです。Memoriaは以下のリポジトリで構成される一つのプロダクトです。

- `memoria-web`: このNext.jsアプリケーション
- `memoria-api`: Go GraphQL APIと永続化ロジック
- `memoria-design`: プロダクト用語とリポジトリ横断設計
- `memoria-IaC`: AWS CDKによるインフラストラクチャ

プロダクト全体の設計上の正本は`memoria-design`です。資料、リポジトリ内のGraphQLスキーマ、実際のAPI挙動が一致しない場合は差異を報告してください。

## アプリケーション境界

- ルートとレイアウトは`src/app`へ置きます。
- 再利用可能なUI部品は`src/components`へ置きます。
- プロダクト機能として構成されたUIは`src/feature`へ置きます。
- 横断的なProviderは`src/providers`へ置きます。
- GraphQLのoperationとfragmentは`src/graphql/operation`と`src/graphql/fragment`へ置きます。
- GraphQLクライアントの生成コードは`src/graphql/gql`へ出力します。
- サーバー専用の環境変数や認証情報を、Client Componentやブラウザ向けbundleへ含めません。
- 認証済みルートと公開ルートの境界を維持します。

## ローカル開発環境

Node.js 24を含むDevboxを使用します。

```sh
devbox shell
npm ci
npm run dev:next
```

Storybookは`npm run dev:storybook`で起動します。シークレット、ローカル環境ファイル、Playwrightレポート、build生成物をコミットしません。

## 検証

変更に応じた検証を行い、完了前に次の基準を確認します。

```sh
npx biome check src
npx tsc --noEmit
npm run test:unit
npm run build:next
```

表示や操作を変更する場合は、関連する検証も実行します。

```sh
npm run build:storybook
npm run test:vrt
npm run test:app
```

表示差分を確認せずに、テストを通す目的だけでVisual Regression Testのsnapshotを更新しません。

## GraphQL開発手順

- `src/graphql/schema`のクライアントスキーマは、`memoria-api/schemas/graphql`が所有するAPI契約を反映します。
- operationまたはfragmentを先に変更し、`npm run gen:graphql`を実行します。
- GraphQL文書と生成されたクライアントコードを同じ変更に含めます。
- `src/graphql/gql`を直接編集しません。
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
- フォーマットなど機械的に判定できる項目はBiome、TypeScript、テスト、CIへ任せます。
