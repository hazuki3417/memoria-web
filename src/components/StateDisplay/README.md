# State display component contract

Media / Group Browser の Loading / Empty / Error は、共通の `StateDisplay` をレイアウト基盤として利用する。

## Public interface

- `LoadingState` / `EmptyState` / `ErrorState` は、いずれも `variant`, `icon`, `title`, `description`, `action` を中心としたAPIを提供する。
- `variant="full"` は表示領域の中央に配置する。 `variant="inline"` は既存データを遮らない部分表示とする。
- 各Featureが表示状態とアクションの実行条件を判断する。共通Componentはデータ取得や状態遷移を担当しない。
- `LoadingState` は既定でLoaderを表示し、従来の追加読み込みの横並び・縦並びを `inlineLayout` で区別する。`inlineGap` / `inlinePadding` は既存UIの維持に必要な範囲のみ使用する。
- `EmptyState` はアイコンとアクションを呼び出し元から受け取る。
- `ErrorState` は既定のエラーアイコンと `role="alert"` を提供する。再試行は原則 `action` で渡す。既存Consumerの `onRetry` は互換として利用可能。
- `LoadingState` の `status` は従来の `role="status"` が付いていた表示で維持する。

## Refactoring invariants

- 既存Consumerの文言、アイコン、アクション、表示条件、スクロール・フォーカス・余白・Responsive Behaviorを合意なく変更しない。
- 共通レイアウトの都合でFeature固有の情報やCapabilityを削らない。
- 全ConsumerのTypeScript・Lint・Visual/Behavioral Regressionを検証し、実行できない検証は未実施として明記する。
