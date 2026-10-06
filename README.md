# Memoria Web

MemoriaのWebアプリケーションです。Next.js、React、Mantine、Apollo Clientを使用し、認証済み画面、画像管理UI、GraphQLクライアントを担当します。

## 関連リポジトリ

- [memoria-api](https://github.com/hazuki3417/memoria-api): GraphQL APIと永続化
- [memoria-design](https://github.com/hazuki3417/memoria-design): プロダクト設計とアーキテクチャの正本
- [memoria-IaC](https://github.com/hazuki3417/memoria-IaC): AWS CDKによる実行環境

UI・GraphQL開発の作業規則は[AGENTS.md](./AGENTS.md)を参照してください。Application Architectureの正本は[memoria-designのFrontend実装規約](https://github.com/hazuki3417/memoria-design/blob/develop/content/system/web/implementation-conventions.mdx)です。

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

## 検証

Quality Gateは再実装期間中のため一時停止しています。ローカルでは変更内容に応じて次を実行します。

```sh
npm run check
npm run typecheck
npm run test:unit
npm run build
npm run build:storybook
npm run test:vrt
```

snapshotは表示差分を確認してから更新します。

## GraphQL

GraphQLクライアントは再実装予定です。API契約の正本は`memoria-api/schemas/graphql/`です。実装時は`memoria-design`のFrontend実装規約に従って配置・Codegen設定を整備します。

## 文書の配置

- プロダクト・画面・コンポーネント設計: `memoria-design`
- セットアップ・コマンド・実装固有の注意: READMEと`AGENTS.md`
- タスク要件: Issue
- 変更内容と検証結果: PR
