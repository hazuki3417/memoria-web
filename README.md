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
npm run check:format
npm run check:lint
npm run check:type
npm run test:unit
npm run build
npm run build:storybook
npm run test:visual
```

VRTのBaseline生成・比較には公式Playwright Dockerイメージを使う手順を推奨します。Docker版の実行方法と検証前提は[tests/vrt/README.md](./tests/vrt/README.md)を参照してください。Node.js 24との互換性と実際の撮影成功は検証前です。

snapshotは表示差分を確認してから更新します。

## GraphQL

GraphQLクライアントは再実装予定です。API契約の正本は`memoria-api/schemas/graphql/`です。実装時は`memoria-design`のFrontend実装規約に従って配置・Codegen設定を整備します。

## 文書の配置

- プロダクト・画面・コンポーネント設計: `memoria-design`
- セットアップ・コマンド・実装固有の注意: READMEと`AGENTS.md`
- タスク要件: Issue
- 変更内容と検証結果: PR

## Development実行用Docker image

APIと同じ配置規則に従い、実行用Dockerfileは `docker/runtime/Dockerfile` に配置します。Build contextと `.dockerignore` はRepository rootとし、ローカルのNext.js開発やVRTとは別に、実行用Dockerfileで既存のNext.js production buildを実行し、非rootのNode.js 24 containerから起動します。画面・認証・API契約は変更しません。イメージの識別子はソースのcommit SHAとし、実際の環境変数やSecretをbuild context、build args、imageに含めません。Build時に使用するAuth0の値はCIと同じダミーです。

```sh
docker build -f docker/runtime/Dockerfile -t "memoria-web:$(git rev-parse HEAD)" .
```

起動時には [Auth0設定手順](docs/auth0-login-logout-setup.md) の6つのAuth0 / Origin設定（AUTH0_DOMAIN、AUTH0_CLIENT_ID、AUTH0_CLIENT_SECRET、AUTH0_SECRET、APP_BASE_URL、AUTH0_AUDIENCE）とサーバー用 `MEMORIA_GRAPHQL_URL` を注入します。Docker network内でAPIに到達するURLを指定してください。AWS Development環境の実行用Composeは [memoria-IaC](https://github.com/hazuki3417/memoria-IaC) が所有します。Web imageのローカル確認用ComposeはこのRepositoryに配置します。実環境のSecretを含むファイルはGitに登録しません。

CIでComposeの設定、Docker imageのbuild、公開ログイン画面のlocalhost HTTP応答を利用した起動healthを検証します。ログイン・画像の操作・実際の環境変数注入はローカルおよびDevelopment環境の結合確認で検証します。

### ローカルでのWeb runtime確認

APIと同じく、通常の開発環境の常駐サービスは `docker-compose.yml`、VRT・CIで利用する検証や開発支援タスクは `docker-compose.integration.yml` に分離します。通常のDevboxによる開発も引き続き利用できます。EC2へ配置するDockerfile自体のbuild・実行、APIとの手動結合確認は `docker-compose.yml` で行います。Webの常駐サービスは `memoria-web-development` projectで起動し、VRTは別projectのまま維持します。

前提はWSL2 UbuntuとDocker Desktop（WSL integration有効）です。API側の標準開発サービスを既存手順で起動し、APIのhost port 8080とhealthを確認します。WebからはDocker Desktopの `host.docker.internal:8080/graphql` に接続します。別の接続先が必要な場合に限り `MEMORIA_GRAPHQL_URL` を設定します（container内のlocalhostはWeb自身です）。このComposeはAPI・DB・Redis・VRTを起動しません。

初回のみ、Repository rootで次の設定ファイルを用意してください。既存の `.env` がある場合は上書きせず、必要な項目を確認してください。

```sh
(umask 077; cp -n .env.example .env)
chmod 600 .env
```

`.env` のダミー値を実際の開発用Auth0設定に置き換え、十分に強いsession secret（例：`openssl rand -hex 32`）を使用します。Auth0のDomain / AudienceはAPIの設定と一致させ、Callback URL `http://localhost:3000/auth/callback`、Logout URL `http://localhost:3000/login` を確認します。このファイルはGitとDocker build contextから除外し、設定値をログに出力しません。Webはhostのloopback:3000のみで公開するため、Next.jsの開発サーバーなど同じportを使うprocessは先に停止してください。

```sh
# 構成の検証（展開済みSecretを出力しない）
docker compose config --quiet

# buildと起動
docker compose up -d --build

# 状態・ログ
docker compose ps
docker compose logs -f web

# 停止・作成したcontainer / networkの削除（APIやVRTには影響しない）
docker compose down
```

Windowsのブラウザで `http://localhost:3000` を開きます。Web imageには`/login`へのHTTP応答で確認するhealthcheckを設定し、CIのCompose起動はhealth状態まで確認します。HTTPの起動確認と、Auth0ログイン・実APIとの結合確認は区別してください。実際にログインしてサービスを利用するには有効な開発用Auth0設定、起動済みAPIおよび必要な開発データが必要です。

ローカル用のimage tagは `memoria-web:local-development` とし、deploy対象には使用しません。AWS向けには前節のcommit SHA / digestを使用します。コンテナによるVRTを実行する場合はIntegration用ファイルを明示して `docker compose -f docker-compose.integration.yml --profile vrt run --rm vrt` を使用します。既存の `npm run test:visual` とVS CodeのVRT taskは従来のDevbox上での直接実行を維持します。実際のDocker build・起動・ログイン・VRT回帰検証は未実施です。

以前の作業ブランチで `.env.integration` を作成した場合は、既存の `.env` を上書きせず必要な設定を移してください。以前の `memoria-web-integration` projectが起動中の場合は、新しいprojectの起動前に停止してください（旧設定を利用できる場合は旧ファイルで停止し、更新後は `docker compose -p memoria-web-integration --env-file .env.integration -f docker-compose.yml down` を使用できます）。
