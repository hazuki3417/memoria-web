# Security and Quality設定

この文書は、memoria-webをprivate repositoryのまま運用し、GitHub管理画面で確認・設定する項目をまとめたものです。GitHubプランによって利用できる機能が異なります。

## 1. セキュリティ機能

`Settings` → `Advanced Security`で、利用可能な次の機能を確認し、有効化します。

- Dependency graph
- Dependabot alerts
- Dependabot security updates
- Secret scanning
- Push protection
- Private vulnerability reporting

Dependabotの定期的なversion updatesは`.github/dependabot.yml`で管理します。npmとGitHub Actionsを週次で確認し、更新PRは通常のQuality Gateで検証します。Dependabotの自動生成タイトルは日本語規約の例外です。

Private vulnerability reportingを有効にした後、`Security` → `Advisories`から非公開報告フォームが利用できることを確認します。

## 2. Code scanning

private repositoryでCode scanningを利用できるかは、現在のGitHubプランとリポジトリ設定に依存します。利用可能と確認できるまではCodeQL workflowを追加しません。利用可能になった場合はDefault setupとAdvanced setupを重複して有効にしません。

## 3. Quality Gate

`.github/workflows/quality.yml`はPRおよび`develop`・`main`へのpushで実行します。Node.js 24、依存関係のインストール、GraphQL client生成、Biome、TypeScript、Vitest、Next.js build、Client bundleのSecret混入チェックを検証します。

Storybook buildとChromiumによるブラウザsmoke testは[PR #15](https://github.com/hazuki3417/memoria-web/pull/15)で整備中です。マージ前は必須チェックとして扱いません。画像差分VRTは基準画像と差分承認の運用が決まるまで必須チェックにしません。

## 4. ブランチRuleset

`develop`と`main`に対するRulesetを設定する場合は、実際に成功したworkflowのチェック名を選択します。現行の候補は`web`です。既存Rulesetの有無を確認してから設定し、PR #15のマージ後に必要なチェックを再評価します。

Required approvals、merge方式、デフォルトブランチ、公開範囲、リリース・デプロイ方針は今回変更しません。

## 5. 設定確認

1. `Settings` → `Advanced Security`で利用可能なSecurity機能を確認する。
2. Dependabotが設定ファイルを認識し、npmとGitHub Actionsの更新PRを作成できることを確認する。
3. Private vulnerability reportingの利用可否を確認する。
4. `quality / web`が成功することを確認する。
5. 既存Rulesetと必須チェックを確認し、必要な変更を別途合意する。

GitHub管理画面でしか変更できない設定は、この文書を追加しただけでは有効になりません。
