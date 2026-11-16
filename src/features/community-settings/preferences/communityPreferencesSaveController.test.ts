import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { createCommunityPreferencesSaveController } from "./communityPreferencesSaveController"
import type { CommunityPreferencesValues } from "./communityPreferences"
import type { CommunityPreferencesSaveOutcome, SaveCommunityPreferencesAction } from "./communityPreferencesSaveOutcome"

const success = (value: CommunityPreferencesValues): CommunityPreferencesSaveOutcome => ({ kind: "success", value })

const makeOperations = (save = vi.fn<SaveCommunityPreferencesAction>().mockResolvedValue(success({ accentColor: "#ABCDEF" }))) => ({
  save,
  observe: vi.fn().mockResolvedValue({ accentColor: "#112233" }),
  confirm: vi.fn(),
  preview: vi.fn().mockReturnValue(1),
  release: vi.fn(),
})

const setup = (save?: ReturnType<typeof vi.fn<SaveCommunityPreferencesAction>>) => {
  const controller = createCommunityPreferencesSaveController()
  const operations = makeOperations(save)
  controller.configure(operations)
  controller.initialize({ accentColor: "#112233" })
  return { controller, operations }
}

describe("Ready画面単位のCommunity Accent AutoSave", () => {
  beforeEach(() => { vi.useFakeTimers() })
  afterEach(() => { vi.useRealTimers() })

  it("有効な色を即時Previewし、400ms待機後に一度だけ保存する", async () => {
    const { controller, operations } = setup()
    controller.edit({ accentColor: "#AABBCC" })
    expect(operations.preview).toHaveBeenCalledWith("#AABBCC")
    expect(operations.save).not.toHaveBeenCalled()
    await vi.advanceTimersByTimeAsync(399)
    expect(operations.save).not.toHaveBeenCalled()
    await vi.advanceTimersByTimeAsync(1)
    expect(operations.save).toHaveBeenCalledTimes(1)
    expect(operations.save).toHaveBeenCalledWith({ accentColor: "#AABBCC" })
    expect(controller.getSnapshot()).toMatchObject({
      confirmed: { accentColor: "#ABCDEF" }, draft: { accentColor: "#AABBCC" }, status: "pending",
    })
  })

  it("完成前HEXは保存しない。直前の有効色も後続の未完成Draftにより無効化する", async () => {
    const { controller, operations } = setup()
    controller.edit({ accentColor: "#AABBCC" })
    controller.edit({ accentColor: "#AAB" })
    await vi.advanceTimersByTimeAsync(500)
    expect(operations.save).not.toHaveBeenCalled()
    expect(controller.getSnapshot()).toMatchObject({
      confirmed: { accentColor: "#112233" }, draft: { accentColor: "#AAB" }, status: "pending",
    })
  })

  it("同一Debounce内の連続変更は最新色だけを送信する", async () => {
    const { controller, operations } = setup(vi.fn<SaveCommunityPreferencesAction>().mockResolvedValue(success({ accentColor: "#445566" })))
    controller.edit({ accentColor: "#AABBCC" })
    await vi.advanceTimersByTimeAsync(200)
    controller.edit({ accentColor: "#445566" })
    await vi.advanceTimersByTimeAsync(400)
    expect(operations.save).toHaveBeenCalledTimes(1)
    expect(operations.save).toHaveBeenCalledWith({ accentColor: "#445566" })
    expect(controller.getSnapshot()).toMatchObject({ confirmed: { accentColor: "#445566" }, status: "saved" })
  })

  it("離脱で有効Pendingを直ちに送信し、Previewと購読を解放する", async () => {
    const { controller, operations } = setup()
    const observer = vi.fn()
    controller.subscribe(observer)
    controller.edit({ accentColor: "#AABBCC" })
    const notifications = observer.mock.calls.length
    const close = controller.close()
    await close
    expect(operations.save).toHaveBeenCalledTimes(1)
    expect(operations.release).toHaveBeenCalledWith(1)
    expect(controller.isClosed()).toBe(true)
    expect(observer).toHaveBeenCalledTimes(notifications)
  })

  it("離脱後はDraft・Failureを新しい画面に復元しない", async () => {
    const previous = setup()
    previous.controller.edit({ accentColor: "#123" })
    await previous.controller.close()
    const next = setup()
    expect(next.controller.getSnapshot()).toMatchObject({
      confirmed: { accentColor: "#112233" }, draft: { accentColor: "#112233" }, failure: null, status: "idle",
    })
    expect(previous.operations.save).not.toHaveBeenCalled()
  })

  it("通信結果不明では自動再送せず、現在値照会後の明示Retryのみ許可する", async () => {
    const save = vi.fn<SaveCommunityPreferencesAction>()
      .mockResolvedValueOnce({ kind: "unknown" })
      .mockResolvedValueOnce(success({ accentColor: "#AABBCC" }))
    const { controller, operations } = setup(save)
    controller.edit({ accentColor: "#AABBCC" })
    await vi.advanceTimersByTimeAsync(400)
    expect(controller.getSnapshot()).toMatchObject({
      failure: "unknown", status: "attention", inspected: false,
    })
    expect(operations.release).not.toHaveBeenCalled()
    controller.edit({ accentColor: "#445566" })
    await vi.advanceTimersByTimeAsync(500)
    expect(save).toHaveBeenCalledTimes(1)
    controller.retry()
    await vi.advanceTimersByTimeAsync(10)
    expect(save).toHaveBeenCalledTimes(1)
    await controller.inspect()
    expect(controller.getSnapshot()).toMatchObject({ inspected: true, observedMatches: false })
    controller.retry()
    await vi.advanceTimersByTimeAsync(0)
    expect(save).toHaveBeenCalledTimes(2)
  })

  it("現在値一致は元のMutation成功と断定せず、確認完了時だけ採用する", async () => {
    const { controller, operations } = setup(
      vi.fn<SaveCommunityPreferencesAction>().mockResolvedValue({ kind: "unknown" }),
    )
    operations.observe.mockResolvedValue({ accentColor: "#AABBCC" })
    controller.edit({ accentColor: "#AABBCC" })
    await vi.advanceTimersByTimeAsync(400)
    await controller.inspect()
    expect(controller.getSnapshot()).toMatchObject({ observedMatches: true, failure: "unknown" })
    controller.confirmObservation()
    expect(operations.confirm).toHaveBeenCalledWith({ accentColor: "#AABBCC" })
    expect(controller.getSnapshot()).toMatchObject({ confirmed: { accentColor: "#AABBCC" }, failure: null })
  })

  it("ValidationはField ErrorとDraftを維持し、離脱時に自動Retryしない", async () => {
    const save = vi.fn<SaveCommunityPreferencesAction>().mockResolvedValue({
      kind: "rejected",
      reason: { kind: "validation", violations: [
        { scope: "FIELD", code: "INVALID_FORMAT", inputPaths: [{ segments: ["accentColor"] }] },
      ] },
    })
    const { controller } = setup(save)
    controller.edit({ accentColor: "#AABBCC" })
    await vi.advanceTimersByTimeAsync(400)
    expect(controller.getSnapshot()).toMatchObject({
      failure: "rejected", draft: { accentColor: "#AABBCC" },
      validation: { fieldErrors: { accentColor: "入力形式を確認してください。" } },
    })
    await controller.close()
    expect(save).toHaveBeenCalledTimes(1)
  })

  it("認可拒否では保存を停止し、再送ボタンからも保存しない", async () => {
    const save = vi.fn<SaveCommunityPreferencesAction>().mockResolvedValue({
      kind: "rejected",
      reason: { kind: "blocked", error: { graphQLErrors: [{ extensions: { code: "FORBIDDEN" } }] } },
    })
    const { controller } = setup(save)
    controller.edit({ accentColor: "#AABBCC" })
    await vi.advanceTimersByTimeAsync(400)
    expect(controller.getSnapshot().failure).toBe("blocked")
    controller.retry()
    await vi.advanceTimersByTimeAsync(1000)
    expect(save).toHaveBeenCalledTimes(1)
  })

  it("異なるCommunityへの新しい画面は別Ownerを使い、遅延結果がDraftへ流入しない", async () => {
    let resolveOld: ((value: CommunityPreferencesSaveOutcome) => void) | undefined
    const oldSave = vi.fn<SaveCommunityPreferencesAction>().mockImplementation(
      () => new Promise<CommunityPreferencesSaveOutcome>((resolve) => { resolveOld = resolve }),
    )
    const older = setup(oldSave)
    older.controller.edit({ accentColor: "#AABBCC" })
    await vi.advanceTimersByTimeAsync(400)
    const close = older.controller.close()
    const newer = setup(vi.fn<SaveCommunityPreferencesAction>().mockResolvedValue(success({ accentColor: "#445566" })))
    newer.controller.edit({ accentColor: "#445566" })
    await vi.advanceTimersByTimeAsync(400)
    resolveOld?.(success({ accentColor: "#AABBCC" }))
    await close
    expect(newer.controller.getSnapshot()).toMatchObject({
      confirmed: { accentColor: "#445566" }, draft: { accentColor: "#445566" }, failure: null,
    })
  })
  it("遅延中の先行保存が終わってから後続の最新値を直列送信する", async () => {
    let resolveFirst: ((value: CommunityPreferencesSaveOutcome) => void) | undefined
    const save = vi.fn<SaveCommunityPreferencesAction>()
      .mockImplementationOnce(() => new Promise<CommunityPreferencesSaveOutcome>((resolve) => { resolveFirst = resolve }))
      .mockResolvedValueOnce({ accentColor: "#445566" })
    const { controller } = setup(save)
    controller.edit({ accentColor: "#AABBCC" })
    await vi.advanceTimersByTimeAsync(400)
    controller.edit({ accentColor: "#445566" })
    expect(save).toHaveBeenCalledTimes(1)
    resolveFirst?.(success({ accentColor: "#AABBCC" }))
    await vi.advanceTimersByTimeAsync(0)
    expect(save).toHaveBeenCalledTimes(2)
    expect(save).toHaveBeenNthCalledWith(2, { accentColor: "#445566" })
    expect(controller.getSnapshot()).toMatchObject({
      confirmed: { accentColor: "#445566" }, draft: { accentColor: "#445566" }, failure: null, status: "saved",
    })
  })

  it("先行Mutation処理中の未完成Draftが後続予約を無効化する", async () => {
    let resolveFirst: ((value: CommunityPreferencesSaveOutcome) => void) | undefined
    const save = vi.fn<SaveCommunityPreferencesAction>().mockImplementation(
      () => new Promise<CommunityPreferencesSaveOutcome>((resolve) => { resolveFirst = resolve }),
    )
    const { controller } = setup(save)
    controller.edit({ accentColor: "#AABBCC" })
    await vi.advanceTimersByTimeAsync(400)
    controller.edit({ accentColor: "#445566" })
    controller.edit({ accentColor: "#445" })
    resolveFirst?.(success({ accentColor: "#AABBCC" }))
    await vi.advanceTimersByTimeAsync(0)
    expect(save).toHaveBeenCalledTimes(1)
    expect(controller.getSnapshot()).toMatchObject({
      confirmed: { accentColor: "#AABBCC" }, draft: { accentColor: "#445" }, status: "pending",
    })
  })

  it("保存結果不明時の古い照会は新しいDraftの確認結果を上書きしない", async () => {
    const { controller, operations } = setup(
      vi.fn<SaveCommunityPreferencesAction>().mockResolvedValue({ kind: "unknown" }),
    )
    let resolveOld: ((value: CommunityPreferencesValues) => void) | undefined
    operations.observe
      .mockImplementationOnce(() => new Promise<CommunityPreferencesValues>((resolve) => { resolveOld = resolve }))
      .mockResolvedValueOnce({ accentColor: "#445566" })
    controller.edit({ accentColor: "#AABBCC" })
    await vi.advanceTimersByTimeAsync(400)
    const old = controller.inspect()
    controller.edit({ accentColor: "#445566" })
    await controller.inspect()
    expect(controller.getSnapshot()).toMatchObject({
      inspected: true, observedMatches: true, draft: { accentColor: "#445566" },
    })
    resolveOld?.({ accentColor: "#112233" })
    await old
    expect(controller.getSnapshot()).toMatchObject({
      inspected: true, observedMatches: true, draft: { accentColor: "#445566" },
    })
  })

  it("結果不明のまま画面離脱しても後続変更を自動送信しない", async () => {
    const save = vi.fn<SaveCommunityPreferencesAction>().mockResolvedValue({ kind: "unknown" })
    const { controller } = setup(save)
    controller.edit({ accentColor: "#AABBCC" })
    await vi.advanceTimersByTimeAsync(400)
    controller.edit({ accentColor: "#445566" })
    await controller.close()
    expect(save).toHaveBeenCalledTimes(1)
  })
})
