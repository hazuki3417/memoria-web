import { act, createElement } from "react"
import { createRoot, type Root } from "react-dom/client"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { useExplicitSave } from "./useExplicitSave"
import type { FormInputViolation } from "../formValidation"

type Save = ReturnType<typeof useExplicitSave<string>>
type Action = (value: string) => Promise<
  | { status: "confirmed"; value: string }
  | { status: "validation"; violations: null }
  | { status: "retryable" }
  | { status: "blocked"; feedback: { title: string; description: string } }
  | { status: "unknown" }
>

const deferred = <T,>() => {
  let resolve!: (value: T) => void
  const promise = new Promise<T>((done) => { resolve = done })
  return { promise, resolve }
}

describe("明示保存の共通Hook", () => {
  let root: Root
  let host: HTMLDivElement
  let currentDraft: string
  let hook!: Save
  let action: ReturnType<typeof vi.fn<Action>>
  let inspect: ReturnType<typeof vi.fn<() => Promise<string>>>
  let adopt: ReturnType<typeof vi.fn<(value: string) => void>>
  let onConfirmed: ReturnType<typeof vi.fn<(value: string) => void>>
  let onValidation: ReturnType<typeof vi.fn<(violations: ReadonlyArray<FormInputViolation> | null) => void>>

  function Harness({ initialStatus = "idle" }: {
    initialStatus?: "idle" | "saving" | "retryable" | "blocked" | "unknown"
  }) {
    hook = useExplicitSave({
      draft: currentDraft,
      changed: currentDraft !== "保存済み",
      invalid: false,
      readDraft: () => currentDraft,
      action,
      inspect,
      adopt,
      onValidation,
      onConfirmed,
      initialStatus,
    })
    return null
  }

  const render = async (status?: "idle" | "saving" | "retryable" | "blocked" | "unknown") => {
    await act(async () => {
      root.render(createElement(Harness, { initialStatus: status }))
    })
  }

  beforeEach(async () => {
    vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true)
    currentDraft = "編集中"
    action = vi.fn<Action>()
    inspect = vi.fn<() => Promise<string>>()
    adopt = vi.fn<(value: string) => void>()
    onConfirmed = vi.fn<(value: string) => void>()
    onValidation = vi.fn<(violations: ReadonlyArray<FormInputViolation> | null) => void>()
    host = document.createElement("div")
    document.body.append(host)
    root = createRoot(host)
    await render()
  })

  afterEach(async () => {
    await act(async () => root.unmount())
    host.remove()
    vi.unstubAllGlobals()
  })

  it("確定した保存結果を一度だけ採用・通知する", async () => {
    action.mockResolvedValue({ status: "confirmed", value: "サーバー確定値" })
    expect(hook.canSubmit).toBe(true)
    await act(async () => { await hook.save("編集中") })
    expect(action).toHaveBeenCalledExactlyOnceWith("編集中")
    expect(adopt).toHaveBeenCalledExactlyOnceWith("サーバー確定値")
    expect(onConfirmed).toHaveBeenCalledExactlyOnceWith("サーバー確定値")
    expect(onValidation).not.toHaveBeenCalled()
    expect(hook.status).toBe("idle")
  })

  it("保存中は入力停止し、同一イベントからの二重保存を防ぐ", async () => {
    const pending = deferred<{ status: "confirmed"; value: string }>()
    action.mockReturnValue(pending.promise)
    await act(async () => {
      void hook.save("編集中")
      void hook.save("編集中")
    })
    expect(action).toHaveBeenCalledTimes(1)
    expect(hook.isInputDisabled).toBe(true)
    expect(hook.canSave).toBe(false)
    await act(async () => { pending.resolve({ status: "confirmed", value: "確定値" }) })
    expect(onConfirmed).toHaveBeenCalledTimes(1)
    expect(hook.isInputDisabled).toBe(false)
  })

  it("Typed ValidationはFormへ委譲し、保存不可の状態には固定しない", async () => {
    action.mockResolvedValue({ status: "validation", violations: null })
    await act(async () => { await hook.save("編集中") })
    expect(onValidation).toHaveBeenCalledExactlyOnceWith(null)
    expect(adopt).not.toHaveBeenCalled()
    expect(onConfirmed).not.toHaveBeenCalled()
    expect(hook.status).toBe("idle")
  })

  it("Blockedは説明を保持し、入力と後続送信を停止する", async () => {
    const feedback = { title: "操作不可", description: "権限を確認してください" }
    action.mockResolvedValue({ status: "blocked", feedback })
    await act(async () => { await hook.save("編集中") })
    expect(hook.status).toBe("blocked")
    expect(hook.failure).toBe("blocked")
    expect(hook.blockedFeedback).toEqual(feedback)
    expect(hook.isInputDisabled).toBe(true)
    await act(async () => { await hook.save("編集中") })
    expect(action).toHaveBeenCalledTimes(1)
  })

  it("再試行可能な拒否はDraftを保持し、明示的な再送のみを許可する", async () => {
    action.mockResolvedValueOnce({ status: "retryable" })
      .mockResolvedValueOnce({ status: "confirmed", value: "確定値" })
    await act(async () => { await hook.save("編集中") })
    expect(hook.failure).toBe("retryable")
    expect(hook.isInputDisabled).toBe(false)
    expect(action).toHaveBeenCalledTimes(1)
    await act(async () => { await hook.save("編集中") })
    expect(action).toHaveBeenCalledTimes(2)
    expect(onConfirmed).toHaveBeenCalledTimes(1)
  })

  it("Unknownの一致照会は自動再送・成功通知せず、明示確認だけを許す", async () => {
    action.mockResolvedValue({ status: "unknown" })
    inspect.mockResolvedValue("編集中")
    await act(async () => { await hook.save("編集中") })
    expect(hook.isUnknown).toBe(true)
    expect(hook.canSubmit).toBe(false)
    await act(async () => { await hook.inspectCurrent?.() })
    expect(hook.inspection).toEqual({ status: "matches", value: "編集中" })
    expect(action).toHaveBeenCalledTimes(1)
    expect(onConfirmed).not.toHaveBeenCalled()
    await act(async () => { hook.confirmObservation() })
    expect(adopt).toHaveBeenCalledExactlyOnceWith("編集中")
    expect(onConfirmed).not.toHaveBeenCalled()
    expect(hook.status).toBe("idle")
  })

  it("Unknownの不一致照会は破棄または明示再送までDraftを採用しない", async () => {
    action.mockResolvedValue({ status: "unknown" })
    inspect.mockResolvedValue("サーバー現値")
    await act(async () => { await hook.save("編集中") })
    await act(async () => { await hook.inspectCurrent?.() })
    expect(hook.inspection).toEqual({ status: "differs", value: "サーバー現値" })
    expect(hook.canResaveInspected).toBe(true)
    expect(adopt).not.toHaveBeenCalled()
    await act(async () => { hook.discardUnconfirmed() })
    expect(adopt).toHaveBeenCalledExactlyOnceWith("サーバー現値")
    expect(onConfirmed).not.toHaveBeenCalled()
    expect(action).toHaveBeenCalledTimes(1)
    expect(hook.status).toBe("idle")
  })

  it("Unknownの照会中にDraftを変更した場合は古い観測を無効化する", async () => {
    const pending = deferred<string>()
    action.mockResolvedValue({ status: "unknown" })
    inspect.mockReturnValue(pending.promise)
    await act(async () => { await hook.save("編集中") })
    await act(async () => { void hook.inspectCurrent?.() })
    expect(hook.inspection.status).toBe("checking")
    currentDraft = "さらに編集"
    await act(async () => {
      hook.onDraftChange()
      root.render(createElement(Harness))
    })
    await act(async () => { pending.resolve("編集中") })
    expect(hook.inspection.status).toBe("idle")
    expect(adopt).not.toHaveBeenCalled()
  })

  it("保存中にFormがUnmountした場合は古い完了応答を採用・通知しない", async () => {
    const pending = deferred<{ status: "confirmed"; value: string }>()
    action.mockReturnValue(pending.promise)
    await act(async () => { void hook.save("編集中") })
    await act(async () => { root.render(null) })
    await act(async () => { pending.resolve({ status: "confirmed", value: "古い結果" }) })
    expect(adopt).not.toHaveBeenCalled()
    expect(onConfirmed).not.toHaveBeenCalled()
  })
})
