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
| `MediaDetailViewerHost` | Mantine fullscreen Modalの標準Portal、Focus/Dismissとviewport `100dvh` | Media ID、Loading状態、Preview/Info layout |
| `MediaDetailLayout` | Preview/InfoPanelの二領域Grid、Compact縦配置・それ以外の横配置 | 画像/Metadata取得、Panel内の操作とアニメーション |
| `MediaDetailPreview` | 既存Preview操作、image/zoom/rotate、前後移動表示 | URL history、GraphQL、Modal host |
| `MediaDetailInfoPanel` | 既存Sections/Download/Delete、幅340pxの開閉、内部スクロール | URL history、GraphQL、Modal host |
| 各Feature Modal | 編集/共有/削除確認とDraftに基づく操作 | Viewer hostを再mountすること |

### 現行の契約・props

`MediaDetailViewerHost` は `opened / onClose / children`、`MediaDetailLayout` は `compact / detailInfoOpened / preview / infoPanel` を受け取る。これは**React実装の現行境界**であり、Design Systemが固定するAPIではない。

既存Visual Contractを保持するため、`MediaDetailViewerHost` のMantine Modalのfullscreen/transparent propsとstyleを維持し、専用`portalProps.target`は廃止して標準Portalへ移行する。LayoutのGrid CSSも元の式を維持する。Panelの340px幅/0.3秒 transition、Previewのheader/footer・zoom・rotate・navigation、Nested Modal、compact判定は今回変更しない。UI状態を一律に初期化するkeyはHost/Layoutへ設定しない。

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

Host/Layout分離は合意済みだが、Compact時のPanel最大高さ、Skeletonの詳細、GraphQL Result Type/Props、標準Portalへの移行によるNested Overlayの重なり順など、既存UI変更を伴う事項はここでは決定しない。検証で仕様判断が必要な場合はユーザーと合意する。

## Stage 2 — URL / History Controller基盤（2026-10-29、実装途中）

`src/features/media-detail/mediaDetailNavigation.ts` に純関数として `mediaId`の厳密なQuery読取、他Query/Hash保持URL生成、duplicateのないimmutable Navigation ID Snapshot、前後位置/Wrap判定、許可route判定を追加した。対応するUnit Testで境界ケースを検証する。

`MediaDetailUrlProvider` はApplicationShell内に一つ配置し、URLのMedia ID、in-app Origin Snapshot、Historyのpush（初回open）/replace（prev-next）/back（安全なoriginに限る）/replace-close（direct access等）を所有する。Next App Routerが持つ`window.history.state`の値を保持して識別用markerを追加し、別画面へのroute changeやBack操作でin-memory sessionを無効化する。GraphQL Queryや画像・編集stateは保持しない。

### 未接続・未検証

- **Controller契約の基盤だけを実装**。Media Browser / Group Browser / Dashboardの既存`MediaDetailDialog`ローカルstateは維持され、Consumerを共通Controllerに接続した段階とは扱わない。
- 共通HostでURL-selected Mediaを表示するには、Stage 3のID独立Detail Query・必須/補助情報のViewModelが必要。Loading/Errorを仮表示して既存Media表示を置換しない。
- Next App Routerのnative History APIでpush/replace後の`usePathname`/searchParams整合、Back/Forward、reload、bfcache、cross-route、close時origin保護、scroll/no-remountのE2E検証が残る。特にSession markerを使ったsafe-back判定が実Router動作で妥当か確認する。
- `mediaDetailNavigationWrap` User Settingsの実接続、DashboardのMedia ID付きCarousel、Group BrowserのAggregate CollectionのSnapshotと実際の閲覧順、URL-only/invalid URL fallbackのUIは未完成。
- Stage 2全体のHuman Review完了とみなさず、追加Consumer接続に伴う設計判断はユーザーと合意してから進む。


## Stage 3 — Detail取得のread-only基盤（2026-10-30、未統合）

GraphQL SDL `src/infrastructure/graphql/schema.graphql` を照合した上で `media(id:)` によるID独立取得を追加。具体実装は `useMediaDetailRead.ts` と、純関数の `mediaDetailReadState.ts` およびUnit Test。

- **必須identity**: Media IDが選択中URLと一致しない古いQuery resultをReady表示しない。取得中、再試行可能な通信失敗、対象不在、取得成功を区別する。
- **画像**: READYかつ利用可能なVariantがある場合のみ表示可能。PROCESSING、FAILED、Variantなし・processing不整合、詳細取得失敗を独立の表示状態へ写像する。現在は最大幅Variantを暫定選択するread-modelであり、最適なdelivery variant/署名URL更新・load/decode完了は後続の責務として残す。
- **補助Collection**: Groups/TagsのPageInfoで全件性を確認。確定0件のみempty、未取得・GraphQL部分エラー・hasNextPageならemptyにしない。partial errorがある場合は安全側に倒して補助Collectionを未確定扱いにする。将来必要な個別field queryと全件paginationは未接続。
- **Query lifecycle**: `network-only`、`errorPolicy: all`。GraphQL/RouterをFullscreen Viewer Host・Responsive Layoutへ持ち込まない。retry callbackを用意するが、UIボタン・Processing Polling・独立画像Retryの導線は未実装。
- **Stage境界**: HookをBrowser/Group/Dashboardにはまだ接続していない。共通Hostに未完成データを流して既存の操作・表示を失わせない。実Consumer移行と独立Loading/Skeleton/Error/Retry UIは次のレビュー対象。

## Stage 3 — Preview / InfoPanel 非同期表示のUI境界（2026-10-30）

- `MediaDetailReadFeedback.tsx`: PreviewのLoading / Processing / Detail Error / Image Delivery Error / Unavailableと手動Retry、InfoのMetadata Skeleton・Error・Retry、Groups/TagsのPending / Error / Incompleteを独立した表示責務へ抽出。
- `MediaDetailPreview` はoptional `readState` と `onRetryImage` を受け取る。未指定時は現在の画像・Zoom・回転・Navigation・Error表示をそのまま維持。非Ready時もViewerのHeader/Navigation/Footerの領域を消さない。
- `MediaDetailInfoPanel` はoptional `detailReadState / groupsReadState / tagsReadState / onRetryDetail` を受け取る。未指定時は現行Info UIを完全に維持。非同期モードでは取得前を「未設定/未共有」とみなさず、Section単位のPending/Error/Incompleteを描画する。
- `MediaDetailViewer` はoptional `read` objectを受け取り、PreviewとInfoPanelへそれぞれの状態とRetry callbackを渡す。Viewer Host/Responsive LayoutへGraphQL依存を追加しない。
- Feature StoryにPreview Loading / Processing / Delivery Error、InfoPanel Loading / Partial Error / Detail Errorを追加。Prototype Story数は増やさない。

**未接続事項**：実Application Controllerが`read`を組み立てる実際のConsumer結線は未実施。GraphQL Read Hook自体の取得成功だけでは画像Browser load/decode成功としないため、load/decodeエラー監視と手動署名URL更新・再試行、Polling停止中UIは別途実装が必要。Community共有情報とDelete許可は現在のRead Queryに含まれないため、非同期モードで未確認の操作を有効化せず、既存Local Modal modeのCapabilityは維持する。Groups/Tagsの編集DraftとRead Data同期もConsumer統合時に検証する。

**検証Gate**：Typecheck / Build / Unit / Interaction / VRTで既存表示が変わらないこと、新Storyで状態別の描画を確認すること。新しいVRT Baselineの正式採用とmergeは別途レビュー・承認する。


## Stage 3 — URL-scoped read-only Presenter Adapter (2026-10-30)

- `useMediaDetailPresentation(scope)` combines `MediaDetailUrlProvider.selectedMediaId` with `useMediaDetailRead` and returns ID-bound detail, preview, groups, tags, and detail retry.
- This adapter is **read-only plumbing**, not a completed viewer connection. No legacy `MediaItem` is fabricated from a URL/media ID, and no new Host is opened by this change.
- The existing `MediaDetailViewer` still requires a local `detail: MediaItem | null` to open. ID-only loading, unavailable, and error rendering must be integrated with a deliberate Host/Presenter contract; Browser/Group/Dashboard migration is not complete.
- Scope is supplied by the consumer rather than inferred from URL; production wiring must validate scope and access rights before showing/editing/sharing/deleting.
- Follow-up verification: correct ID on rapid transitions, independent Preview/InfoPanel errors, mounted Host continuity, URL Back/Forward/reload, nested overlays, Compact/Medium/Wide visual behavior, and real browser image load/decode.
- This is an intermediate checkpoint. CI and Human Visual Review must be completed on the new commit. No baseline acceptance or merge is implied.


## Stage 3 — ID-only read-only fullscreen composition (2026-10-30)

- `MediaDetailIdViewer` was added as an **isolated, unconnected read-only checkpoint**. It consumes `MediaDetailPresentation`, opens `MediaDetailViewerHost` from the selected URL ID, reuses `MediaDetailLayout`, and displays independent Preview and Metadata/Groups/Tags read states. It does not require a listing `MediaItem` to display loading/error/unavailable.
- This component is **not yet a production replacement** for `MediaDetailViewer`: the established Preview navigation/zoom/rotate and InfoPanel edit/share/delete actions are not wired here. Its information panel currently has basic read-only presentation, not the full legacy visual/behavior contract. Do not migrate existing consumers until these contracts are preserved and visual changes are reviewed.
- Image `load`/`decode` success, signed URL refresh, Processing Polling and retry, forward/back, scope permissions, transitions, and responsive panel motion are still outstanding.
- Work on the existing Viewer/Consumer paths is intentionally deferred; changing consumers now would cause a capability regression. CI/VRT and Human Visual Review on this new commit remain necessary. PR remains Draft, no baseline approval or merge.


## Stage 3 — URL navigation / viewport interaction checkpoint (2026-10-30)

- The isolated `MediaDetailIdViewer` now uses `useMediaDetailUrl().navigation` for previous/next controls and `navigateMediaDetail` for URL transitions. `useMediaDetailViewport` owns zoom/rotation state; controls are disabled on Compact consistently with the existing Compact design intent. URL selection changes reset zoom/rotation, including Back/Forward-driven changes.
- The ID-only read-only path remains **unmounted in application consumers**. Its current controls are preliminary and **not a visual/behavioral parity claim**: existing zoom slider/direct entry, animated InfoPanel, navigation transitions, edit/share/delete and all source-specific actions remain in the legacy Viewer and are not replicated here. Reuse or refactor existing Preview/InfoPanel before consumer migration to preserve them rather than substituting this reduced UI.
- Gate required: Typecheck, Build, Unit, Interaction, VRT and Human Visual Review after this commit; validate next/previous, Back/Forward, no-remount, stale ID and image, Compact/Medium/Wide, and zoom reset before any production wiring. PR remains Draft.


## Stage 3 — Navigation control reuse checkpoint (2026-10-30)

- Extracted `MediaDetailNavigationButton` from the existing `MediaDetailPreview`; both legacy Preview and isolated `MediaDetailIdViewer` consume it.
- Visual props are copied from the legacy component: subtle gray ActionIcon, lg size, the same Tabler chevrons and accessible labels. The legacy callbacks still run `prepareNavigation(direction)` then `setDetail(item)`; the ID-only consumer runs its own URL navigation callback. State ownership and existing navigation semantics are not merged.
- This is a narrowly scoped reusable **control**, not a replacement of the full Preview, its transitions, zoom slider, direct input, image delivery, or the animated InfoPanel. Do not migrate existing consumers based solely on this extraction.
- Automated gates and Human Visual Review on this commit are still required; PR remains Draft.
