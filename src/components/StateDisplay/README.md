# State display component contract

Media / Group Browser の Loading / Empty / Error は、共通の `StateDisplay` をレイアウト基盤として使用する。

## Public API

- 各ラッパーは共通して `variant`, `title`, `description`, `action` を受け付ける。
- `variant` は `full`（初回取得等の中央表示）と `inline`（一部のみの状態表示）に限る。レイアウトの `padding` / `gap` / `layout` は公開しない。
- `LoadingState` はLoader、`role="status"`、表示サイズを内部で決める。
- `EmptyState` は用途別の `kind` を持たず、必要な `icon` と `iconColor` を利用側から受け取る。アイコンの種類はFeatureごとの意味に応じて選択する。
- `ErrorState` はエラーアイコン・色・`role="alert"` を内部で決める。再試行処理は `onRetry`、その他の操作は `action` で渡す。
- `StateDisplay` は3種類に共通するレイアウト描画だけを担当する。状態判定、通信、イベント処理は各Featureが担当する。
- `LoadingState` のInlineは共通の中央横並び表示とする。以前のGroup追加取得の縦並び・余白指定からのデザイン変更は意図的な統一として扱う。

## Regression contract

- 既存Consumerの文言、状態判定、再試行、管理権限、選択、フォーカス、スクロール等の振る舞いを維持する。
- Emptyのアイコン種別は既存のMedia / Group / 検索 / Tagの表現を維持する。
- 構造変更後は型・Lintに加えてVisual / Behavioral Regressionを検証し、未検証項目は明記する。
