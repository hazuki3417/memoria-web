# Memoria Web

MemoriaのWebアプリケーションです。Next.js、React、Mantine、Apollo Clientを使用し、認証済み画面、画像管理UI、GraphQLクライアントを担当します。

## 関連リポジトリ

- [memoria-api](https://github.com/hazuki3417/memoria-api): GraphQL APIと永続化
- [memoria-design](https://github.com/hazuki3417/memoria-design): プロダクト設計とアーキテクチャの正本
- [memoria-IaC](https://github.com/hazuki3417/memoria-IaC): AWS CDKによる実行環境

UI・GraphQL開発の作業規則は[AGENTS.md](./AGENTS.md)を参照してください。

## ローカル開発

前提:

- Windows + WSL2 Ubuntu
- VS Code（WSLへ接続）
- Devbox
- Node.js 24

リポジトリをUbuntu側で開き、次のコマンドはUbuntu上のDevbox内で実行します。

```sh
devbox shell
npm ci
npm run dev:next
```

Storybook:

```sh
npm run dev:storybook
```

WindowsのWebブラウザから、起動時に表示される`localhost` URLへアクセスします。APIと結合確認する場合は、`memoria-api`も別のWSLターミナルとDevboxで起動します。

`node_modules`をWindows、macOS、他のLinux環境からコピーまたは共有せず、依存関係は`package.json`とlockfileへ記録します。共通の環境構成とトラブルシューティングは[memoria-designのローカル開発環境](https://github.com/hazuki3417/memoria-design/blob/develop/pages/local-development.mdx)を参照してください。

Devbox shellを終了する場合は`exit`を実行します。

## 環境変数とSecret

Server側の環境変数は`src/env/server.ts`で検証し、Server Component、Route Handler、middlewareからのみ参照します。必須値が不足している場合、URLが不正な場合、または`AUTH0_SECRET`が32文字未満の場合は安全に失敗します。

| 変数 | 必須 | 用途 |
| --- | --- | --- |
| `APP_BASE_URL` | 必須 | Web applicationのURL |
| `AUTH0_DOMAIN` | 必須 | Auth0 tenantのdomain |
| `AUTH0_CLIENT_ID` | 必須 | Auth0 applicationのclient ID |
| `AUTH0_CLIENT_SECRET` | 必須 | Auth0 applicationのclient secret |
| `AUTH0_SECRET` | 必須 | Session暗号化用の32文字以上のsecret |
| `API_URI` | 任意 | GraphQL APIのURL。未指定時は`http://localhost:8080/graphql` |
| `AUTH0_SCOPE` | 任意 | 認可時に要求するscope |
| `AUTH0_AUDIENCE` | 任意 | 認可時に要求するaudience |

ローカル開発ではGit管理対象外の`.env`または実行環境の環境変数に設定します。Secretを`next.config.mjs`の`env`、`NEXT_PUBLIC_*`、Client Component、Git管理対象のfileへ記載しません。

GitHub ActionsではNext.js buildに必要な項目へCI専用の無効な仮値を設定します。実際のAuth0 credentialや本番Secretは使用しません。

## 検証

GitHub Actionsの`quality / web`は、Pull Requestと`develop`・`main`へのpushで、Node.js 24の依存関係導入、GraphQL client生成、Biome、TypeScript、Vitest、Next.js buildを実行します。Node.jsのversionは`package.json`の`engines.node`を正本とします。

人間がローカル環境で同等のquality gateを再現する場合:

```sh
npm ci
npm run quality
```

各checkは個別にも実行できます。

```sh
npm run gen:graphql
npm run check
npm run typecheck
npm run test
npm run build
```

GraphQL生成物はGit管理対象外のため、clean checkoutでは型検査とbuildの前に生成します。Storybook build、Playwright、VRT、Application E2E、Auth0・APIを含む結合testは、実行時間と外部依存を確認するまで初期の必須quality gateに含めません。

UI変更では必要に応じて次も実行します。

```sh
npm run build:storybook
npm run test:vrt
npm run test:app
```

snapshotは表示差分を確認してから更新します。

## GraphQL

- operation: `src/graphql/operation/`
- fragment: `src/graphql/fragment/`
- API schemaの反映先: `src/graphql/schema/`
- 生成コード: `src/graphql/gql/`

```sh
npm run gen:graphql
```

API契約の正本は`memoria-api/schemas/graphql/`です。生成コードを直接編集しません。

## 文書の配置

- プロダクト・画面・コンポーネント設計: `memoria-design`
- セットアップ・コマンド・実装固有の注意: READMEと`AGENTS.md`
- タスク要件: Issue
- 変更内容と検証結果: PR
