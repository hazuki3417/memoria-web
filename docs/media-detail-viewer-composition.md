# Media Detail Fullscreen Viewer — Host / Layout 実装設計

Status: **A案合意済み・構造分離実装中**（2026-10-29）。実装の比較基準は `develop` の merge commit `d0cd8890`。URL / History / GraphQL・Processingは本変更のスコープ外。

## Source of Truth

- Product / Visual / Responsive contract: [Media Detail UI Design](https://github.com/hazuki3417/memoria-design/blob/main/content/screens/media-detail-ui-design.mdx)
- Viewer/Navigation/Loading/Retry controller: `feature/media-detail-url-history-contract:docs/media-detail-controller-design.md`（別ブランチの設計ドラフト。未確定の技術検証は Issue #178）
- Frontend implementation: `src/features/media-detail/MediaDetailViewer/`、`MediaDetailPreview/`、`MediaDetailInfoPanel/`

## 現在の責務境界（今回の実装）

| 要素 | 所有する責務 | 所有しない責務 |
| --- | --- | --- |
| `MediaDetailDialog` | Viewer/編集/共有/削除Modalのcomposition、既存のlocal editing/viewport state | RouterやGraphQLへの直接接続 |
| `MediaDetailViewer` | PreviewとInfoPanelへのProps接続、prev/nextの現行配列からの導出 | Fullscreen Modal設定、Gridの寸法 |
| `MediaDetailViewerHost` | Mantine fullscreen Modal、`#application-modal-root`、既存のPortal/Focus/Dismissとviewport `100dvh` | Media ID、Loading状態、Preview/Info layout |
| `MediaDetailLayout` | Preview/InfoPanelの二領域Grid、Compact縦配置・それ以外の横配置 | 画像/Metadata取得、Panel内の操作とアニメーション |
| `MediaDetailPreview` | 既存Preview操作、image/zoom/rotate、前後移動表示 | URL history、GraphQL、Modal host |
| `MediaDetailInfoPanel` | 既存Sections/Download/Delete、幅340pxの開閉、内部スクロール | URL history、GraphQL、Modal host |
| 各Feature Modal | 編集/共有/削除確認とDraftに基づく操作 | Viewer hostを再mountすること |

### 現行の契約・props

`MediaDetailViewerHost` は `opened / onClose / children`、`MediaDetailLayout` は `compact / detailInfoOpened / preview / infoPanel` を受け取る。これは**React実装の現行境界**であり、Design Systemが固定するAPIではない。

既存Visual Contractを保持するため、`MediaDetailViewerHost` のMantine Modal propsとstyleは抽出前から変更しない。LayoutのGrid CSSも元の式を維持する。Panelの340px幅/0.3秒 transition、Previewのheader/footer・zoom・rotate・navigation、Nested Modal、compact判定は今回変更しない。UI状態を一律に初期化するkeyはHost/Layoutへ設定しない。

## Controller統合時のViewModel受け渡し（次段階・未実装）

- URL / History Controllerが選択中IDとOrigin Snapshotを所有し、`MediaDetailDataController`が個別詳細・preview・processing/画像状態を取得する。HostもLayoutもRouter/GraphQLをimportしない。
- UI Presenterは `detail`（loading / ready / retryable-error / unavailable）、`preview`（detail-loading / processing / image-loading / ready / processing-failed / delivery-error / polling-stopped / unavailable）、`navigation`、`scope`とcallbackを構成する。Controllerの実行時Type/GraphQL schemaは別ブランチの詳細設計と照合してから確定する。
- PreviewとInfoPanelのLoadingは**独立**。InfoPanelは未取得値を「未設定」「未共有」とみなさず、SkeletonやErrorを表示する。Previewは詳細取得中のspinner、画像ロード中、Processing、画像エラーと手動retryを別状態にする。処理PollingはDialog表示中のみ、通信エラー3回連続失敗なら停止して手動再開する。
- Media切替え時にHostをunmountしない。前IDのMetadata/Preview/Errorを現IDへ誤表示しないようID付きstateもしくはrequest generation guardを置き、既存zoom/rotate reset、方向transition、Panel開閉状態を保持する。
- 編集・共有・削除の既存Capability/Focus/Draft/結果不明処理を簡略化しない。Viewerより上に表示するTask Modalは既存Feature Componentを利用する。

## 検証Gate

1. **構造抽出（今回）**: TypeScript、Next build、Unit、Storybook Interaction、VRT。既存のMediaDetailViewer StoryとPanel/Preview Storyを再利用する。Baselineの差分があれば任意承認せず差分を調査する。
2. **Controller統合（次段階）**: URL history（push/open、replace/next、Back/Forward、reload）、origin保持、no-remount、Navigation snapshot、stale response、GraphQL partial errorをIntegration/E2Eで検証。
3. **Async UI（次段階）**: Loading/Processing/READY/FAILED、画像load/decode error、独立InfoPanel Loading/Error、Polling 3回停止、手動retry、Compact/Medium/Wide VRT。
4. **Human Visual Review**: 375×812 / 1024×768 / 1440×900、Panel open/closed、Portrait/Landscape、Scroll、Zoom/Rotate、Nested Modal、Keyboard/Focus、既存baselineとの差分を確認。

Host/Layout分離は合意済みだが、Compact時のPanel最大高さ、Skeletonの詳細、GraphQL Result Type/Props、Portal root撤去の時期など、既存UI変更を伴う事項はここでは決定しない。検証で仕様判断が必要な場合はユーザーと合意する。
