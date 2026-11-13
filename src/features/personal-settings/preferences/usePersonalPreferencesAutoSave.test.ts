import { act, createElement } from "react"
import { createRoot, type Root } from "react-dom/client"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { defaultUserPreferences, type UserPreferences, type UserPreferencesPatch } from "./userPreferences"
import { usePersonalPreferencesAutoSave } from "./usePersonalPreferencesAutoSave"

type Controller = ReturnType<typeof usePersonalPreferencesAutoSave>
let root: Root
let host: HTMLDivElement
let current!: Controller
let save: ReturnType<typeof vi.fn<(patch: UserPreferencesPatch) => Promise<UserPreferences>>>

const renderHook = (onInspect?: () => Promise<UserPreferences>) => {
  root.render(createElement(() => {
    current = usePersonalPreferencesAutoSave(save, defaultUserPreferences, onInspect)
    return null
  }))
}

beforeEach(async () => {
  vi.useFakeTimers()
  save = vi.fn(async (patch: UserPreferencesPatch) => ({ ...defaultUserPreferences, ...patch }))
  host = document.createElement("div")
  document.body.appendChild(host)
  root = createRoot(host)
  await act(async () => renderHook())
})
afterEach(async () => {
  await act(async () => root.unmount())
  host.remove()
  vi.useRealTimers()
})

describe("Personal Preferencesの画面Lifetime保存", () => {
  it("有効PatchをDebounce・合流し、確定値だけを反映する", async () => {
    await act(async () => {
      current.enqueue({ dateFormat: "DD_MM_YYYY" })
      current.enqueue({ mediaThumbnailSize: "LARGE" })
    })
    expect(save).not.toHaveBeenCalled()
    await act(async () => { await vi.advanceTimersByTimeAsync(400) })
    expect(save).toHaveBeenCalledExactlyOnceWith({
      dateFormat: "DD_MM_YYYY", mediaThumbnailSize: "LARGE",
    })
    expect(current.saveStatus).toBe("saved")
    expect(current.confirmed).toMatchObject({ dateFormat: "DD_MM_YYYY", mediaThumbnailSize: "LARGE" })
  })

  it("未送信PatchはUnmount時に一度だけ送信試行し、次画面へDraftを保持しない", async () => {
    await act(async () => { current.enqueue({ mediaDetailNavigationWrap: true }) })
    await act(async () => root.unmount())
    expect(save).toHaveBeenCalledExactlyOnceWith({ mediaDetailNavigationWrap: true })
    await vi.advanceTimersByTimeAsync(400)
    expect(save).toHaveBeenCalledTimes(1)
    // Session/永続Registryは存在せず、再MountはQueryを初期値として利用する。
    root = createRoot(host)
    await act(async () => renderHook())
    expect(current.confirmed.mediaDetailNavigationWrap).toBe(false)
    expect(current.saveError).toBeNull()
  })

  it("Unknownは自動再送せず、現在値照会後の明示Retryだけを許可する", async () => {
    save.mockRejectedValueOnce(new Error("lost response"))
    await act(async () => { current.enqueue({ mediaDetailNavigationWrap: true }) })
    await act(async () => { await vi.advanceTimersByTimeAsync(400) })
    expect(current.saveError).toBe("unknown")
    await act(async () => { current.enqueue({ mediaThumbnailSize: "LARGE" }) })
    await act(async () => { await vi.advanceTimersByTimeAsync(800) })
    expect(save).toHaveBeenCalledTimes(1)
    // QueryなしでのUnknown Retryは不可。
    await act(async () => { current.retry() })
    expect(save).toHaveBeenCalledTimes(1)
  })

  it("Typed ValidationのFieldを表示し、新しい明示Attemptだけを実行する", async () => {
    const { SettingsInputValidationError } = await import("@/infrastructure/graphql/settingsMutationResult")
    save.mockRejectedValueOnce(new SettingsInputValidationError([
      { scope: "FIELD", code: "INVALID_VALUE", inputPaths: [{ segments: ["mediaDetailNavigationWrap"] }] },
    ]))
    await act(async () => { current.enqueue({ mediaDetailNavigationWrap: true }) })
    await act(async () => { await vi.advanceTimersByTimeAsync(400) })
    expect(current.saveError).toBe("validation")
    expect(current.validation?.fieldErrors.mediaDetailNavigationWrap).toBeTruthy()
    await act(async () => { current.retry() })
    await act(async () => { await vi.advanceTimersByTimeAsync(0) })
    expect(save).toHaveBeenCalledTimes(2)
    expect(current.saveError).toBeNull()
  })

  it("Unknownの一致確認は旧Mutationを自動再送しない", async () => {
    save.mockRejectedValueOnce(new Error("lost response"))
    await act(async () => root.unmount())
    root = createRoot(host)
    await act(async () => renderHook(async () => ({ ...defaultUserPreferences, mediaDetailNavigationWrap: true })))
    await act(async () => { current.enqueue({ mediaDetailNavigationWrap: true }) })
    await act(async () => { await vi.advanceTimersByTimeAsync(400) })
    expect(current.saveError).toBe("unknown")
    await act(async () => { await current.inspect() })
    expect(current.observedMatches).toBe(true)
    await act(async () => { current.confirmObservation() })
    expect(current.saveError).toBeNull()
    expect(save).toHaveBeenCalledTimes(1)
  })
})
