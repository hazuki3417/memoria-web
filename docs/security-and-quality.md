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

Quality Gateの一時停止・再開に関する**全Repository共通の運用ルール**は、`memoria-design/content/test-design.mdx`を正本とします。この文書では共通ルールを重複記載しません。

Web固有の検査対象と実行条件は、WebのQuality Gate詳細設計で定義します。

## 4. ブランチRuleset

`develop`と`main`に対するRulesetでrequired checkを設定する場合は、Quality Gate再開後に実際に成功したworkflowのチェック名を選択します。停止中のworkflowをrequired checkとして要求しないよう、既存Rulesetとの整合を確認します。

## 5. 設定確認

1. `Settings` → `Advanced Security`で利用可能なSecurity機能を確認する。
2. Dependabotが設定ファイルを認識し、npmとGitHub Actionsの更新PRを作成できることを確認する。
3. Private vulnerability reportingの利用可否を確認する。
4. Required Checksを設定する場合、対象Workflowが有効であることを確認する。
5. Quality Gateのトリガー変更時は、実行対象と必要な検査を確認する。

GitHub管理画面でしか変更できない設定は、この文書を追加しただけでは有効になりません。
