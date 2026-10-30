# Media Detail Fullscreen Viewer — Host / Layout 実装設計

Status: **A案合意済み・構造分離実装中**（2026-10-29）。実装の比較基準は `develop` の merge commit `d0cd8890`。URL / History / GraphQL・Processingは本変更のスコープ外。

## Source of Truth

- Product / Visual / Responsive contract: [Media Detail UI Design](https://github.com/hazuki3417/memoria-design/blob/main/content/screens/media-detail-ui-design.mdx)
- Viewer/Navigation/Loading/Retry controller: `feature/media-detail-url-history-contract:docs/media-detail-controller-design.md`（別ブランチの設計ドラフト。未確定の技術検証は Issue #178）
- Frontend implementation: `src/features/media-detail/MediaDetailViewer/`、`MediaDetailPreview/`、`MediaDetailInfoPanel/`

## 現在の責務境界（今回の実装）

| 要素 | 所有する責務 | 所有しない責務 |
| --- | --- | --- |
| `MediaDetailModal` | Viewer/編集/共有/削除Modalのcomposition、既存のlocal editing/viewport state | RouterやGraphQLへの直接接続 |
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

- **Controller契約の基盤だけを実装**。Media Browser / Group Browser / Dashboardの既存`MediaDetailModal`ローカルstateは維持され、Consumerを共通Controllerに接続した段階とは扱わない。
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


## Stage 3 — Shared rotation controls (2026-10-30)

- Extracted `MediaDetailRotationControls` from the legacy Preview and reused it in the isolated ID-only viewer. It keeps the existing reset/left/right icons, labels, subtle button variant and callback order (`setAnimated` before `setRotate`). State remains owned by the respective viewport hook.
- The legacy footer grid, Compact visibility rule, zoom slider and direct input remain in place. Existing consumers are not switched. This is a small control-level extraction, not full Preview/InfoPanel parity.
- Verify TypeScript/Build/Unit/Interaction/VRT and Human Visual Review on the new head before proceeding; do not claim visual regression equivalence solely from successful CI. PR stays Draft.


## Stage 3 — Shared Zoom toolbar checkpoint (2026-10-30)

- Extracted `MediaDetailZoomControls` directly from legacy `MediaDetailPreview` and reused it in both legacy Preview and the isolated ID-only read-only Viewer. It preserves the reset/minus/plus Tabler icons, subtle variants, disabled bounds (50–300%), 10% increments, 100px slider, and existing `ZoomInput` with direct numeric entry/dropdown.
- Zoom state remains owned by `useMediaDetailViewport` or the legacy viewport props; no URL/router or data fetching was placed into the toolbar. The legacy Preview footer grid and Compact visibility are unchanged.
- **Not full visual parity**: the ID-only Viewer still has a separate preliminary footer and information panel rather than consuming the full original Preview/InfoPanel composition. Preserve the original Layout, spacing, animated panel, transitions and all actions before migration of existing consumers.
- Typecheck/Build/Unit/Storybook Interaction/VRT and Human Visual Review of the new head remain required. PR stays Draft; no baseline approval or merge.


## Stage 3 — Shared InfoPanel frame checkpoint (2026-10-30)

- Following user authorization to modify the currently nonfunctional legacy Media Detail Dialog directly, extracted the **existing** animated outer layout into `MediaDetailInfoPanelFrame` and reused it from both `MediaDetailInfoPanel` and the ID-only read-only viewer.
- Preserved the legacy 340px Wide/Medium width, 0.3-second width/height + opacity transitions, Compact vertical placement, body background/borders, flex column, internal scrolling, and optional fixed footer. The legacy InfoPanel still owns all of its original sections, edit/share/delete controls, and async states.
- This is a **frame-level** extraction, not full content/component consolidation. The ID-only read-only panel still lacks the complete legacy sections/actions. Do not treat it as production equivalent or migrate consumers on this basis alone.
- New head requires Typecheck/Build/Unit/Interaction/VRT and Human Visual Review. Keep PR Draft; no baseline approval/merge.


## Component placement and responsibility review (2026-10-30)

Agreed approach: inventory existing components first, relocate/reuse as appropriate, and split only when responsibility boundaries genuinely require it. Do not rebuild an existing UI for a new consumer. Existing visual, behavior, responsive and capability contracts remain unchanged unless a separate change is approved.

| Existing code | Responsibility | Review direction (not yet final) |
| --- | --- | --- |
| `MediaDetailModal` | local selection, editing and nested Modal composition | retain feature actions while revisiting controller boundary |
| `MediaDetailViewer` | established Preview / InfoPanel composition | consolidate the ID-based consumer here instead of duplicating composition |
| `MediaDetailPreview` | preview, animations and viewport controls | reuse original visual component; abstract navigation/data source only as needed |
| `MediaDetailInfoPanel` | Metadata, Groups, Tags, Community, delete | keep as the sole existing panel; express permissions and data as inputs |
| `MediaDetailMetadata` | fixture metadata / download controls | distinguish production data from fixture without losing download capability |
| `MediaDetailGroupsSection` / `MediaDetailTagsSection` | counts, badges, expand/collapse, editing | reuse directly; preserve editing capability for authorized consumers |
| `MediaDetailIdViewer` | provisional second ID-only visual composition | candidate for removal after unifying existing Viewer; not a permanent second UI |
| `MediaDetailNavigationButton`, `MediaDetailRotationControls`, `MediaDetailZoomControls`, `MediaDetailInfoPanelFrame` | visual controls / animated frame | evaluate grouping/placement, avoid unnecessary abstractions |
| `MediaDetailUrlProvider`, `useMediaDetailRead`, `useMediaDetailPresentation` | history, read model, adapter | isolate from display and mutation concerns |

The final folder layout and component ownership remain under review. Before moving files, inspect imports, Stories, and all consumers; verify visual and behavioral parity after changes. The ID-only viewer and the existing Viewer must not be kept as two independently implemented permanent interfaces.

Current branch's prior changes remain subject to CI and Human Visual Review; no baseline approval or merge is implied.


## Placement checkpoint — Preview-owned Zoom controls (2026-10-30)

- Moved the *existing* `MediaDetailZoomControls` into `MediaDetailPreview/MediaDetailZoomControls.tsx`. Retained the control JSX, zoom limits, slider, and `ZoomInput` behavior; adjusted only its relative import.
- Updated imports in both `MediaDetailPreview` and temporary `MediaDetailIdViewer`, then removed the old top-level component file. Verified the new path and both import sites from the branch and confirmed the old path is absent.
- Responsibility boundary: Preview owns its viewport control presentation. The Viewer composes Preview and InfoPanel; URL/history and data fetching remain outside. Additional relocation of Navigation/Rotation/InfoPanel sections requires an import/consumer review rather than automatic moving.
- The temporary ID Viewer remains an unapproved transitional component, not the intended final UI. No existing consumer migration in this checkpoint. New head CI and Human Visual Review remain mandatory; Draft PR and baseline policy unchanged.


## Correction: refactor the original Viewer only (2026-10-30)

**User-confirmed design constraint:** Existing Media Detail components are the implementation to refactor directly. Maintaining the original Viewer while rebuilding a parallel ID-only Viewer was **not** the intended approach. The temporary `MediaDetailIdViewer.tsx` has been deleted; its provisional alternative toolbar/layout/panel must not be carried forward as a second implementation.

- The established `MediaDetailViewer`, `MediaDetailPreview`, `MediaDetailInfoPanel`, and `MediaDetailModal` remain the canonical components. Adapt their data/navigation/controller inputs in place, preserving their visual, interactive, responsive and action capabilities.
- `MediaDetailNavigationButton`, `MediaDetailRotationControls`, `MediaDetailZoomControls` were relocated under `MediaDetailPreview/` rather than duplicated. `MediaDetailInfoPanelFrame` is used inside the existing InfoPanel.
- The URL/history and GraphQL reading hooks are controller/data responsibilities, not alternative visual components; connect them to the original composition only after the original Viewer can represent ID-only loading/unavailable/error without fabricating a listing MediaItem.
- Prior sections of this document describing ID-only Viewer's planned migration are historical checkpoint records and **superseded** by this correction. Do not reintroduce a parallel Viewer without an explicit new design agreement.
- Validate all original Preview controls, animated InfoPanel, original sections and edit/share/delete actions, Compact/Medium/Wide visuals, history navigation, stale data safety, and image retry/polling. Latest commit requires CI plus Human Visual Review before progression to consumer integration. PR remains Draft.


## Consolidation checkpoint — canonical Viewer URL entry (2026-10-30)

After user authorization to execute implementation without per-step design confirmation:

- Removed the parallel `MediaDetailIdViewer` and relocated Preview controls under the **existing** `MediaDetailPreview/` directory.
- Updated `MediaDetailPreview` to accept optional `selectedId`, URL-navigation state/callback, and a nullable listing item; it continues to own the *original* 44px header, 44px navigation columns, 48px footer, zoom/rotate controls, and animated image transitions. An ID-selected Loading/Error/Unavailable state can now render with no listing `MediaItem`.
- Updated the **existing** `MediaDetailViewer` to open for `selectedId` as well as local `detail`. Read-mode InfoPanel is read-only while its original sections, frames, and animations are reused. Local-mode props are preserved.
- Added **controller-only** `MediaDetailUrlController` (not an alternate Viewer) and mounted it below `MediaDetailUrlProvider` in ApplicationShell, passing `useMediaDetailPresentation`, URL navigation, viewport state, and scoped Personal/Community GraphQL reads into the canonical Viewer. No fixture-only edit/share/delete mutation is enabled in this ID-selected path.
- Aligned read model and read feedback with the `uploadedBy` field selected by the GraphQL query instead of a mismatching `uploader` name.

### Remaining end-to-end gates / unresolved design

1. Consumer initiation: existing Media Browser, Group Browser and Dashboard opening actions are not yet connected to `openMediaDetail` and immutable loaded-ID snapshots; local dialog pathways remain until capability-preserving migration is tested.
2. Image delivery: actual `load/decode` verification, manual image retry, signed URL renewal and stale-image protection remain unimplemented.
3. Processing: dialog-only 5s polling, tab visibility pause, 3 consecutive transport failures followed by manual restart remain unimplemented.
4. URL lifecycle: Next Router/History E2E, back/forward/dismiss, close on route changes, direct reload, and unique shared Host mounting require browser verification. The old local dialog and new ApplicationShell URL Host can coexist until consumer migration; duplicated overlays must be prevented before migration.
5. Live permission/mutation paths: download, Groups/Tags editing, Community share/unshare, and delete cannot be enabled from fixture callbacks; map server authorization and real operations first.
6. Human Visual Review: all Compact/Medium/Wide, 340px panel/animation, original Preview controls, nested overlays/focus, loading/error/partial state VRT and interaction review are required. Baseline acceptance and PR merge not authorized.

**Review decisions reserved for final discussion:** scope of live mutation authorization, fallback on invalid direct URLs, wrap preference ownership, remote pagination completeness, original download action, and exact image retry/URL-renewal boundary. No silent simplification of legacy functionality is approved.

Current implementation is an integration checkpoint and **not** a claim that all end-to-end behavior is complete or that latest CI has passed. Keep PR Draft.


## Follow-up implementation and verification ledger (2026-10-30)

The existing (canonical) `MediaDetailViewer` is mounted through a controller-only `MediaDetailUrlController`, never through a replacement visual Viewer. Current branch also implements:

- Existing Preview: ID-only Loading/Error/Unavailable rendering; browser image `load`/`decode` readiness and delivery error state; manually invoked retry via image remount and GraphQL refetch; the local-item path continues to render its existing image.
- Processing read: while the URL-selected Dialog is visible and tab is visible, poll at 5s; after transport failure retry at 10s; stop after 3 consecutive failures; show manual restart. Poll state is keyed to ID, and tested pure helpers enforce the thresholds. Apollo partial GraphQL errors are not counted as transport failures.
- Navigation: route controller uses the saved `mediaDetailNavigationWrap` preference; ID changes through previous/next or browser History reset Zoom/Rotate. The original Preview remains the common visual component.
- Read model: `uploadedBy` matches the checked GraphQL SDL. GraphQL `ScopeInput`, `Media.processing.status`, `Image.variants` and group/tag field names were read from repository SDL.
- Storybook: original Preview and original Viewer include ID-only Loading/Unavailable states; no separate Viewer Story exists.

**Important known gaps:** Existing Media Browser/Group Browser/Dashboard click flows have NOT yet been migrated; preserving their real/mocked editing/group-share/delete actions requires a final permission/mutation contract. Image retry currently reuses refetch/remount, but signed URL refresh semantics and real-browser image decode tests are not yet verified. Back/Forward/bfcache, visibility changes, three-error sequencing, focus/nested dialog, and exact visual/behavioral parity remain E2E/Human Review gates. Groups/Tags Connection pagination beyond the first 100 edges is not implemented and must not be represented as complete. The User Preferences for initial InfoPanel state and full data formatting are not fully connected. No VRT baseline is accepted. No PR merge.

Open tracking Issue: [#178](https://github.com/hazuki3417/memoria-web/issues/178) remains the cross-cutting specification/integration gate. This checkpoint is not the final completion of the issue or the PR.


### Additional scope-safety correction (2026-10-30)

On a change of GraphQL variables (especially Personal ↔ Community scope with the *same* Media ID), Apollo may retain a preceding response. `useMediaDetailRead` now masks that response during `NetworkStatus.setVariables`, so neither the Preview nor the InfoPanel renders old-scope data as ready while the new scope is resolving. Existing media-ID mismatch protection remains. This is a safety guard; authorization E2E and server enforcement remain required.


## Stage 4 — Scope-aware Processing Polling checkpoint (2026-10-30)

- `useMediaDetailRead` のPolling停止状態、連続通信失敗数、通信中ガードを、Media IDだけでなくScope（PERSONAL/COMMUNITY とCommunity ID）の組で隔離する。同じMedia IDでScopeが変更されても、前Scopeの3回失敗による停止状態を持ち越さない。
- 旧Scopeの通信が遅延完了しても、新Scopeの通信中ガードを解除しない。既存の可視タブ時のみPolling・5秒/10秒間隔・3回連続失敗停止・手動再試行の振る舞いは維持する。
- これはHookの局所的な安全性修正であり、URL Controller/Consumer結線やViewerのUI契約を変更しない。ユーザー合意の暫定運用で `[skip ci]` を指定し、Typecheck/Build/Unit/Interaction/VRTは未検証として管理する。

- Polling stream identityは区切り文字連結ではなく `mediaDetailPollingIdentity` のJSON tupleで構成し、Media ID・Scope Type・Community IDの組を安全に区別する。純関数のUnit TestでScope切替、Media切替、区切り文字の衝突防止を固定する。
- 前回コミットで生じたHookの`useEffect`依存配列の閉じ括弧不足を修正済み。CI利用上限のためこれらのコミットには`[skip ci]`を指定し、ローカルTypecheck/Unit/Build/Interaction/VRTは未実行・要確認とする。


## Modal命名への統一（2026-10-30）

`develop`の命名方針に合わせ、Media Detail fullscreen Mantine Modal の公開Component・Props・実装フォルダ・Storybookタイトルを `MediaDetailDialog` から `MediaDetailModal` に改名した。Media BrowserとGroup Browserのconsumer importも変更した。表示・操作・layout・responsive behaviorは変更せず、VRTのStory ID変更に伴うbaselineの取り扱いとローカルTypecheck/Build/VRT確認を後続Gateに残す。CI利用上限によりcommitは `[skip ci]` を利用する。


## Stage 2 — Media Browserの非破壊的Controller接続境界（2026-10-30）

- `MediaBrowser`へoptional `onOpenMediaDetail(mediaId, orderedLoadedMediaIds)`を追加。指定時はMedia選択を外部URL Controllerへ委譲し、未指定時は従来どおりローカル`MediaDetailModal`を開く。順序は現在読み込まれた`stateItems`の表示順に固定する。
- `MediaBrowserContainer`ではまだこのcallbackを渡さない。URL Controllerのread-only Modeには編集・共有・削除の実操作が未接続であり、Consumerを切り替えるとCapability regressionになるため。既存Prototype/Group Browserも変更しない。
- 次段階でApplication ShellのURL Hostの単一所有者、Scope検証、実操作のpermission/pending/unknown contract、Back/Forward/no-remountを整えてからConsumerを移行する。変更のTypecheck、Build、Interaction、VRTはローカルで検証する。CIの実行上限中は `[skip ci]` を適用する。


## Stage 2 — 実ConsumerのURL Viewer接続（2026-10-30）

- Media Browser/Group Browserの実データ経路は`openMediaDetail`で共通URL Viewerへ委譲する。Prototype等でCallbackがない場合は従来のlocal Modalを維持する。
- DashboardのRecent Media Carouselにoptional Media ID/クリックCallbackを追加し、`DashboardContainer`の実GraphQLデータでIDと表示順（最大32件）を対応付けてURL Controllerへ委譲する。IDのないPrototype表示は従来どおり非クリック。
- 同じApplication Shellの`MediaDetailUrlController`が共通Viewerを所有する。編集・共有・削除などBackend契約未接続の操作はURL read-only modeで有効化しない。
- ローカルTypecheck/Build/Unit/Interaction/VRT/E2E（Back/Forward、Carouselページ送り、Scope切替、no-remount、Focus）が必要。GitHub Actions上限中は`[skip ci]`を継続し、PRはDraftを維持する。


## Stage 3 — Media Detail Groups / TagsのRelay全件取得（2026-10-30）

- Detail Queryに`groupsAfter`/`tagsAfter`と`pageInfo.endCursor`を追加。各Collectionで`hasNextPage`が真なら、選択中Media IDとScopeに紐づくCursorを使って`fetchMore`し、ID重複を排除して既存edgesに結合する。
- 次Cursorが欠落・同一、通信が失敗する場合は自動取得を止め、`hasNextPage`を真のまま維持する。未完了Collectionを「空/全件」とみなさない。処理の動作・React/Apollo型整合と中断後の手動復旧はローカルテストで確認が必要。
- 既存ViewerのVisual/Behavioral Contractは変更しない。利用枠上限中は`[skip ci]`、PR Draftを維持する。


### Groups / Tags Paginationの手動復旧導線（2026-10-30）

- `MediaDetailReadFeedback.DetailCollectionStatus` の `incomplete` / `error` で再試行ボタンを表示し、既存のInfoPanelから `retryDetail` へ接続する。
- 手動再試行では失敗したCursorの停止状態を解除してDetailを再取得し、最初のページから安全に再構築する。未取得Collectionを確定0件とみなさない。
- この経路のローカルTypecheck/Unit/InteractionおよびApollo実動作検証は未完了。特にCursor失敗、Scope変更、再試行の競合は確認が必要。暫定 `[skip ci]` 運用を継続する。


### Stage 4 — Variant署名URLの期限前更新（2026-10-30）

- READYかつURLを表示可能なMediaでのみ、署名付きVariant URL（有効期限15分）を12分経過後に`media(id:)`再取得する。表示中は1分間隔で経過を確認し、非表示タブでは更新しない。再表示時は経過時間を評価して必要なら再取得する。
- Media ID・Scope変更時は更新基準をリセットし、同時再取得を抑止する。画像load/decodeエラー時の再試行は自動化せず、既存のユーザー操作によるGraphQL再取得と画像remountを使う。
- 12分の境界、非表示タブと非READY状態をUnit Testで固定した。実ブラウザでの期限切れ、GraphQL通信競合、画像decode、VRTとローカルTypecheck/Buildは未検証。GitHub Actions上限期間中は`[skip ci]`を継続する。


### Stage 5 — Personal Media削除Mutation接続（2026-10-30）

- 実URL ViewerのPersonal Scopeでのみ削除確認Modalを有効化する。`DeleteMediaInput {mediaId,idempotencyKey}` に従ってGraphQL `deleteMedia` を呼び出し、`DELETING`受理応答を確認した場合のみViewerを閉じて受付通知する。物理削除完了とは表示しない。
- 通信失敗・不明応答時は受理済みの可能性があるため、同じMedia IDへの再試行で同一idempotencyKeyを再利用する。確認Modalを閉じた場合のみキーを破棄する。Communityでの削除権限UXは未確定のため有効化しない。共有・共有解除とGroups/Tags編集は引き続き未接続。
- タイプチェック・Mutationの成功/拒否/Unknown・Navigation/Focus・削除後リスト更新・VRTを検証する必要がある。CI上限中は`[skip ci]`を付けPRはDraftを維持する。


### URL Viewer — Tags編集と一覧同期（2026-10-30）

- 既存Media DetailのTags節・TagsEditModalを再利用し、URL Viewerで実API `mediaTagEditState` と `updateMediaTags` を接続した。編集開始時は現在のMedia IDとScopeに紐づくTag状態Tokenをnetwork-onlyで取得する。
- 保存前にTokenとDetail上の所属Tag ID集合の整合性を照合する。Token取得失敗は再試行UIを表示し、取得中・保存中の操作を禁止する。保存時は既存のTag IDを再利用し、新規名はnameで送信する。成功後にDetailを再取得し、失敗・結果不明時は成功表示しない。
- Personal削除が`DELETING`受付済みの場合、Media BrowserとDashboard Recent Mediaの有効Queryをrefetchする。一覧再取得失敗は削除受付失敗として扱わない。
- **非対象**: Processing Polling、未実装のCommunity共有・共有解除、Original Download。Group編集の実Mutation接続は別途バックエンド契約照合が必要。
- **検証未完了**: Typecheck/Build/Unit/Interaction/VRT/E2E、実ブラウザでのTag新規作成・競合・Scope切替・通信断・削除後一覧更新。CI上限のため今回のGitHub反映のみで合格判定しない。PR #221はDraft、mergeしない。

### Media削除後のGroup Detail同期とTag Draft破棄（2026-10-30）

- `deleteMedia` が `DELETING` を返した後に、既存の `MediaBrowserList`、`DashboardRecentMedia` に加えて `BrowseGroupDetail` のアクティブQueryも再取得する。Mutationの受付と一覧同期の成否は独立して扱い、削除受付を過大に確約しない。
- URL Viewerで Media ID が変更された場合、開いていた Tag 編集対象とDraftを破棄する。過去のMediaの編集内容を別Mediaへ送らない。Processing Pollingは無変更。
- **未検証**: 3画面での実一覧同期、Group DetailのページングCache、Tags編集途中の遷移とMutation結果、Typecheck / Build / Browser E2E / VRT。PRはDraftのまま維持する。

### URL Viewer — Groups分類編集の実API接続（2026-10-30）

- canonical Viewerの既存Groupsセクションと`GroupsEditModal`を再利用。URL ViewerのGroups取得が全件完了した場合だけ編集を開く。
- `mediaGroups(scope:)`のRelayページをCursorで取得し、候補一覧が完結するまで保存させない。取得失敗は再試行を表示。候補のIDを用い、`removeMediaFromGroup`と`addMediaToGroup`を逐次実行する。
- MutationのSUCCEEDED/ALREADY_APPLIEDのみ受付を確認する。途中で失敗・結果不明になった場合は部分成功を想定して成功表示せず、Media DetailとアクティブなGroup一覧/詳細を再取得する。
- Media移動時はGroups編集のDraftを破棄。**未検証**: 実APIの権限判定、分類操作の部分成功・不明結果、複数ページ、Scope切替、Typecheck/Build/Interaction/VRT/E2E。CI Gate/Human Visual Review前のcheckpointであり、PR #221のmergeはしない。
