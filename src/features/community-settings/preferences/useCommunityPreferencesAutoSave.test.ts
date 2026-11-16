import { act, createElement, StrictMode } from "react"
import { createRoot } from "react-dom/client"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { useCommunityPreferencesAutoSave } from "./useCommunityPreferencesAutoSave"
import type { CommunityPreferencesDraft, CommunityPreferencesValues } from "./communityPreferences"
import type { CommunityPreferencesSaveOutcome, SaveCommunityPreferencesAction } from "./communityPreferencesSaveOutcome"

const success = (value: CommunityPreferencesValues): CommunityPreferencesSaveOutcome => ({ kind: "success", value })

const makeOperations = (save = vi.fn<SaveCommunityPreferencesAction>().mockResolvedValue(success({ accentColor: "#ABCDEF" }))) => ({
  save,
  observe: vi.fn().mockResolvedValue({ accentColor: "#112233" }),
  confirm: vi.fn(),
  preview: vi.fn().mockReturnValue(1),
  release: vi.fn(),
})

const cleanups = new Set<() => void>()

const setup = (save?: ReturnType<typeof vi.fn<SaveCommunityPreferencesAction>>, strict = false) => {
  const operations = makeOperations(save)
  const root = createRoot(document.createElement("div"))
  let current!: ReturnType<typeof useCommunityPreferencesAutoSave>
  const render = vi.fn()
  const preview = { preview: operations.preview, release: operations.release }

  const Harness = () => {
    current = useCommunityPreferencesAutoSave("#112233", operations, preview)
    render(current.snapshot)
    return null
  }
  const element = createElement(Harness)
  act(() => root.render(strict ? createElement(StrictMode, null, element) : element))

  const cleanup = () => {
    if (!cleanups.delete(cleanup)) return
    act(() => root.unmount())
  }
  cleanups.add(cleanup)
  const autoSave = {
    edit: (draft: CommunityPreferencesDraft) => { act(() => current.edit(draft)) },
    getSnapshot: () => current.snapshot,
    retry: () => { act(() => current.retry()) },
    inspect: () => current.inspect(),
    confirmObservation: () => { act(() => current.confirmObservation()) },
    unmount: async () => { await act(async () => cleanup()) },
    render,
  }
  return { autoSave, operations }
}

describe("Ready画面単位のCommunity Accent AutoSave", () => {
  beforeEach(() => { vi.useFakeTimers() })
  afterEach(async () => {
    await act(async () => { for (const cleanup of cleanups) cleanup() })
    vi.useRealTimers()
  })

  it("有効な色を即時Previewし、400ms待機後に一度だけ保存する", async () => {
    const { autoSave, operations } = setup()
    autoSave.edit({ accentColor: "#AABBCC" })
    expect(operations.preview).toHaveBeenCalledWith("#AABBCC")
    expect(operations.save).not.toHaveBeenCalled()
    await act(async () => { await vi.advanceTimersByTimeAsync(399) })
    expect(operations.save).not.toHaveBeenCalled()
    await act(async () => { await vi.advanceTimersByTimeAsync(1) })
    expect(operations.save).toHaveBeenCalledTimes(1)
    expect(operations.save).toHaveBeenCalledWith({ accentColor: "#AABBCC" })
    expect(autoSave.getSnapshot()).toMatchObject({
      confirmed: { accentColor: "#ABCDEF" }, draft: { accentColor: "#AABBCC" }, status: "pending",
    })
  })

  it("完成前HEXは保存しない。直前の有効色も後続の未完成Draftにより無効化する", async () => {
    const { autoSave, operations } = setup()
    autoSave.edit({ accentColor: "#AABBCC" })
    autoSave.edit({ accentColor: "#AAB" })
    await act(async () => { await vi.advanceTimersByTimeAsync(500) })
    expect(operations.save).not.toHaveBeenCalled()
    expect(autoSave.getSnapshot()).toMatchObject({
      confirmed: { accentColor: "#112233" }, draft: { accentColor: "#AAB" }, status: "pending",
    })
  })

  it("同一Debounce内の連続変更は最新色だけを送信する", async () => {
    const { autoSave, operations } = setup(vi.fn<SaveCommunityPreferencesAction>().mockResolvedValue(success({ accentColor: "#445566" })))
    autoSave.edit({ accentColor: "#AABBCC" })
    await act(async () => { await vi.advanceTimersByTimeAsync(200) })
    autoSave.edit({ accentColor: "#445566" })
    await act(async () => { await vi.advanceTimersByTimeAsync(400) })
    expect(operations.save).toHaveBeenCalledTimes(1)
    expect(operations.save).toHaveBeenCalledWith({ accentColor: "#445566" })
    expect(autoSave.getSnapshot()).toMatchObject({ confirmed: { accentColor: "#445566" }, status: "saved" })
  })

  it("離脱で有効Pendingを直ちに送信し、Previewと購読を解放する", async () => {
    const { autoSave, operations } = setup()
    autoSave.edit({ accentColor: "#AABBCC" })
    const notifications = autoSave.render.mock.calls.length
    await autoSave.unmount()
    expect(operations.save).toHaveBeenCalledTimes(1)
    expect(operations.release).toHaveBeenCalledWith(1)
    expect(autoSave.render).toHaveBeenCalledTimes(notifications)
  })

  it("離脱後はDraft・Failureを新しい画面に復元しない", async () => {
    const previous = setup()
    previous.autoSave.edit({ accentColor: "#123" })
    await previous.autoSave.unmount()
    const next = setup()
    expect(next.autoSave.getSnapshot()).toMatchObject({
      confirmed: { accentColor: "#112233" }, draft: { accentColor: "#112233" }, failure: null, status: "idle",
    })
    expect(previous.operations.save).not.toHaveBeenCalled()
  })

  it("通信結果不明では自動再送せず、現在値照会後の明示Retryのみ許可する", async () => {
    const save = vi.fn<SaveCommunityPreferencesAction>()
      .mockResolvedValueOnce({ kind: "unknown" })
      .mockResolvedValueOnce(success({ accentColor: "#AABBCC" }))
    const { autoSave, operations } = setup(save)
    autoSave.edit({ accentColor: "#AABBCC" })
    await act(async () => { await vi.advanceTimersByTimeAsync(400) })
    expect(autoSave.getSnapshot()).toMatchObject({
      failure: "unknown", status: "attention", inspected: false,
    })
    expect(operations.release).not.toHaveBeenCalled()
    autoSave.edit({ accentColor: "#445566" })
    expect(operations.preview).toHaveBeenLastCalledWith("#445566")
    await act(async () => { await vi.advanceTimersByTimeAsync(500) })
    expect(save).toHaveBeenCalledTimes(1)
    autoSave.retry()
    await act(async () => { await vi.advanceTimersByTimeAsync(10) })
    expect(save).toHaveBeenCalledTimes(1)
    await act(async () => { await autoSave.inspect() })
    expect(autoSave.getSnapshot()).toMatchObject({ inspected: true, observedMatches: false })
    autoSave.retry()
    await act(async () => { await vi.advanceTimersByTimeAsync(0) })
    expect(save).toHaveBeenCalledTimes(2)
  })

  it("現在値一致は元のMutation成功と断定せず、確認完了時だけ採用する", async () => {
    const { autoSave, operations } = setup(
      vi.fn<SaveCommunityPreferencesAction>().mockResolvedValue({ kind: "unknown" }),
    )
    operations.observe.mockResolvedValue({ accentColor: "#AABBCC" })
    autoSave.edit({ accentColor: "#AABBCC" })
    await act(async () => { await vi.advanceTimersByTimeAsync(400) })
    await act(async () => { await autoSave.inspect() })
    expect(autoSave.getSnapshot()).toMatchObject({ observedMatches: true, failure: "unknown" })
    autoSave.confirmObservation()
    expect(operations.confirm).toHaveBeenCalledWith({ accentColor: "#AABBCC" })
    expect(autoSave.getSnapshot()).toMatchObject({ confirmed: { accentColor: "#AABBCC" }, failure: null })
  })

  it("ValidationはField ErrorとDraftを維持し、離脱時に自動Retryしない", async () => {
    const save = vi.fn<SaveCommunityPreferencesAction>().mockResolvedValue({
      kind: "rejected",
      reason: { kind: "validation", violations: [
        { scope: "FIELD", code: "INVALID_FORMAT", inputPaths: [{ segments: ["accentColor"] }] },
      ] },
    })
    const { autoSave } = setup(save)
    autoSave.edit({ accentColor: "#AABBCC" })
    await act(async () => { await vi.advanceTimersByTimeAsync(400) })
    expect(autoSave.getSnapshot()).toMatchObject({
      failure: "rejected", draft: { accentColor: "#AABBCC" },
      validation: { fieldErrors: { accentColor: "入力形式を確認してください。" } },
    })
    await autoSave.unmount()
    expect(save).toHaveBeenCalledTimes(1)
  })

  it("認可拒否では保存を停止し、再送ボタンからも保存しない", async () => {
    const save = vi.fn<SaveCommunityPreferencesAction>().mockResolvedValue({
      kind: "rejected",
      reason: { kind: "blocked", error: { graphQLErrors: [{ extensions: { code: "FORBIDDEN" } }] } },
    })
    const { autoSave } = setup(save)
    autoSave.edit({ accentColor: "#AABBCC" })
    await act(async () => { await vi.advanceTimersByTimeAsync(400) })
    expect(autoSave.getSnapshot().failure).toBe("blocked")
    autoSave.retry()
    await act(async () => { await vi.advanceTimersByTimeAsync(1000) })
    expect(save).toHaveBeenCalledTimes(1)
  })

  it("異なるCommunityへの新しい画面は別Ownerを使い、遅延結果がDraftへ流入しない", async () => {
    let resolveOld: ((value: CommunityPreferencesSaveOutcome) => void) | undefined
    const oldSave = vi.fn<SaveCommunityPreferencesAction>().mockImplementation(
      () => new Promise<CommunityPreferencesSaveOutcome>((resolve) => { resolveOld = resolve }),
    )
    const older = setup(oldSave)
    older.autoSave.edit({ accentColor: "#AABBCC" })
    await act(async () => { await vi.advanceTimersByTimeAsync(400) })
    await older.autoSave.unmount()
    const newer = setup(vi.fn<SaveCommunityPreferencesAction>().mockResolvedValue(success({ accentColor: "#445566" })))
    newer.autoSave.edit({ accentColor: "#445566" })
    await act(async () => { await vi.advanceTimersByTimeAsync(400) })
    await act(async () => { resolveOld?.(success({ accentColor: "#AABBCC" })) })
    expect(newer.autoSave.getSnapshot()).toMatchObject({
      confirmed: { accentColor: "#445566" }, draft: { accentColor: "#445566" }, failure: null,
    })
  })
  it("遅延中の先行保存が終わってから後続の最新値を直列送信する", async () => {
    let resolveFirst: ((value: CommunityPreferencesSaveOutcome) => void) | undefined
    const save = vi.fn<SaveCommunityPreferencesAction>()
      .mockImplementationOnce(() => new Promise<CommunityPreferencesSaveOutcome>((resolve) => { resolveFirst = resolve }))
      .mockResolvedValueOnce(success({ accentColor: "#445566" }))
    const { autoSave } = setup(save)
    autoSave.edit({ accentColor: "#AABBCC" })
    await act(async () => { await vi.advanceTimersByTimeAsync(400) })
    autoSave.edit({ accentColor: "#445566" })
    expect(save).toHaveBeenCalledTimes(1)
    await act(async () => {
      resolveFirst?.(success({ accentColor: "#AABBCC" }))
      await vi.advanceTimersByTimeAsync(0)
    })
    expect(save).toHaveBeenCalledTimes(2)
    expect(save).toHaveBeenNthCalledWith(2, { accentColor: "#445566" })
    expect(autoSave.getSnapshot()).toMatchObject({
      confirmed: { accentColor: "#445566" }, draft: { accentColor: "#445566" }, failure: null, status: "saved",
    })
  })

  it("先行Mutation処理中の未完成Draftが後続予約を無効化する", async () => {
    let resolveFirst: ((value: CommunityPreferencesSaveOutcome) => void) | undefined
    const save = vi.fn<SaveCommunityPreferencesAction>().mockImplementation(
      () => new Promise<CommunityPreferencesSaveOutcome>((resolve) => { resolveFirst = resolve }),
    )
    const { autoSave } = setup(save)
    autoSave.edit({ accentColor: "#AABBCC" })
    await act(async () => { await vi.advanceTimersByTimeAsync(400) })
    autoSave.edit({ accentColor: "#445566" })
    autoSave.edit({ accentColor: "#445" })
    await act(async () => {
      resolveFirst?.(success({ accentColor: "#AABBCC" }))
      await vi.advanceTimersByTimeAsync(0)
    })
    expect(save).toHaveBeenCalledTimes(1)
    expect(autoSave.getSnapshot()).toMatchObject({
      confirmed: { accentColor: "#AABBCC" }, draft: { accentColor: "#445" }, status: "pending",
    })
  })

  it("保存結果不明時の古い照会は新しいDraftの確認結果を上書きしない", async () => {
    const { autoSave, operations } = setup(
      vi.fn<SaveCommunityPreferencesAction>().mockResolvedValue({ kind: "unknown" }),
    )
    let resolveOld: ((value: CommunityPreferencesValues) => void) | undefined
    operations.observe
      .mockImplementationOnce(() => new Promise<CommunityPreferencesValues>((resolve) => { resolveOld = resolve }))
      .mockResolvedValueOnce({ accentColor: "#445566" })
    autoSave.edit({ accentColor: "#AABBCC" })
    await act(async () => { await vi.advanceTimersByTimeAsync(400) })
    let old!: Promise<void>
    act(() => { old = autoSave.inspect() })
    autoSave.edit({ accentColor: "#445566" })
    await act(async () => { await autoSave.inspect() })
    expect(autoSave.getSnapshot()).toMatchObject({
      inspected: true, observedMatches: true, draft: { accentColor: "#445566" },
    })
    await act(async () => {
      resolveOld?.({ accentColor: "#112233" })
      await old
    })
    expect(autoSave.getSnapshot()).toMatchObject({
      inspected: true, observedMatches: true, draft: { accentColor: "#445566" },
    })
  })

  it("結果不明のまま画面離脱しても後続変更を自動送信しない", async () => {
    const save = vi.fn<SaveCommunityPreferencesAction>().mockResolvedValue({ kind: "unknown" })
    const { autoSave } = setup(save)
    autoSave.edit({ accentColor: "#AABBCC" })
    await act(async () => { await vi.advanceTimersByTimeAsync(400) })
    autoSave.edit({ accentColor: "#445566" })
    await autoSave.unmount()
    expect(save).toHaveBeenCalledTimes(1)
  })
  it("Strict Modeの再setup後も現在の画面Ownerで一度だけ保存できる", async () => {
    const { autoSave, operations } = setup(
      vi.fn<SaveCommunityPreferencesAction>().mockResolvedValue(success({ accentColor: "#AABBCC" })),
      true,
    )
    autoSave.edit({ accentColor: "#AABBCC" })
    await act(async () => { await vi.advanceTimersByTimeAsync(400) })
    expect(operations.save).toHaveBeenCalledTimes(1)
    expect(autoSave.getSnapshot()).toMatchObject({
      confirmed: { accentColor: "#AABBCC" }, status: "saved",
    })
  })

})
