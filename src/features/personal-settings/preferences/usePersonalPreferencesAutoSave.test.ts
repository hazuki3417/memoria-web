import { act, createElement } from "react"
import { createRoot, type Root } from "react-dom/client"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { defaultPersonalPreferences, type PersonalPreferencesValues, type PersonalPreferencesPatch } from "./personalPreferences"
import { usePersonalPreferencesAutoSave } from "./usePersonalPreferencesAutoSave"

type Controller = ReturnType<typeof usePersonalPreferencesAutoSave>
let root: Root
let host: HTMLDivElement
let current!: Controller
let save: ReturnType<typeof vi.fn<(patch: PersonalPreferencesPatch) => Promise<PersonalPreferencesValues>>>

const renderHook = (onInspect?: () => Promise<PersonalPreferencesValues>) => {
  root.render(createElement(() => {
    current = usePersonalPreferencesAutoSave(save, defaultPersonalPreferences, onInspect)
    return null
  }))
}

beforeEach(async () => {
  vi.useFakeTimers()
  save = vi.fn(async (patch: PersonalPreferencesPatch) => ({ ...defaultPersonalPreferences, ...patch }))
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

  it("未完成HEXは直前のAccent予約だけを無効化する", async () => {
    await act(async () => {
      current.setAccentDraft("#AABBCC")
      current.enqueue({ personalAccentColor: "#AABBCC" })
      current.enqueue({ mediaDetailNavigationWrap: true })
      current.setAccentDraft("#AAB")
    })
    await act(async () => { await vi.advanceTimersByTimeAsync(400) })
    expect(save).toHaveBeenCalledExactlyOnceWith({ mediaDetailNavigationWrap: true })
    expect(current.confirmed.personalAccentColor).toBe(defaultPersonalPreferences.personalAccentColor)
  })

  it("予約を取り消した場合は送信せず保存待ちを解除する", async () => {
    await act(async () => {
      current.setAccentDraft("#AABBCC")
      current.enqueue({ personalAccentColor: "#AABBCC" })
      current.setAccentDraft("#AAB")
    })
    await act(async () => { await vi.advanceTimersByTimeAsync(400) })
    expect(save).not.toHaveBeenCalled()
    expect(current.saveStatus).toBe("idle")
    expect(current.draftPatch).toEqual({})
  })

  it("先行Attemptが失敗した場合は未完成HEXで送信済みの変更を失わない", async () => {
    let reject!: (error: Error) => void
    save.mockImplementationOnce(() => new Promise((_resolve, fail) => { reject = fail }))
    await act(async () => {
      current.setAccentDraft("#AABBCC")
      current.enqueue({ personalAccentColor: "#AABBCC" })
      await vi.advanceTimersByTimeAsync(400)
    })
    await act(async () => {
      current.enqueue({ personalAccentColor: "#445566" })
      current.setAccentDraft("#445")
      reject(new Error("lost response"))
    })
    expect(save).toHaveBeenCalledExactlyOnceWith({ personalAccentColor: "#AABBCC" })
    expect(current.draftPatch).toEqual({ personalAccentColor: "#AABBCC" })
    expect(current.saveError).toBe("unknown")
    expect(current.saveStatus).toBe("attention")
  })

  it("先行Attemptの成功後は取消済みの後続Accentを保存待ちにしない", async () => {
    let resolve!: (values: PersonalPreferencesValues) => void
    save.mockImplementationOnce(() => new Promise(done => { resolve = done }))
    await act(async () => {
      current.enqueue({ personalAccentColor: "#AABBCC" })
      await vi.advanceTimersByTimeAsync(400)
    })
    await act(async () => {
      current.enqueue({ personalAccentColor: "#445566" })
      current.setAccentDraft("#445")
      resolve({ ...defaultPersonalPreferences, personalAccentColor: "#AABBCC" })
    })
    expect(save).toHaveBeenCalledTimes(1)
    expect(current.confirmed.personalAccentColor).toBe("#AABBCC")
    expect(current.draftPatch).toEqual({})
    expect(current.saveStatus).toBe("saved")
  })

  it("未完成HEXだけが残る場合は離脱時にも送信しない", async () => {
    await act(async () => {
      current.setAccentDraft("#AABBCC")
      current.enqueue({ personalAccentColor: "#AABBCC" })
      current.setAccentDraft("#AAB")
    })
    await act(async () => root.unmount())
    expect(save).not.toHaveBeenCalled()
    root = createRoot(host)
  })

  it("保存後に変化した取得値をEcho待ちで無期限に拒否しない", async () => {
    await act(async () => root.unmount())
    root = createRoot(host)
    const Harness = ({ values }: { values: PersonalPreferencesValues }) => {
      current = usePersonalPreferencesAutoSave(save, values)
      return null
    }
    await act(async () => root.render(createElement(Harness, { values: defaultPersonalPreferences })))
    await act(async () => {
      current.enqueue({ personalAccentColor: "#AABBCC" })
      await vi.advanceTimersByTimeAsync(400)
    })
    expect(current.confirmed.personalAccentColor).toBe("#AABBCC")
    await act(async () => root.render(createElement(Harness, { values: { ...defaultPersonalPreferences, personalAccentColor: "#778899" } })))
    expect(current.confirmed.personalAccentColor).toBe("#778899")
  })

  it("同値の正常再取得も新しい取得完了として扱う", async () => {
    await act(async () => root.unmount())
    root = createRoot(host)
    const Harness = ({ ready }: { ready: boolean }) => {
      current = usePersonalPreferencesAutoSave(save, defaultPersonalPreferences, undefined, undefined, undefined, ready)
      return null
    }
    await act(async () => root.render(createElement(Harness, { ready: true })))
    await act(async () => {
      current.enqueue({ personalAccentColor: "#AABBCC" })
      await vi.advanceTimersByTimeAsync(400)
    })
    expect(current.confirmed.personalAccentColor).toBe("#AABBCC")
    await act(async () => root.render(createElement(Harness, { ready: false })))
    expect(current.confirmed.personalAccentColor).toBe("#AABBCC")
    await act(async () => root.render(createElement(Harness, { ready: true })))
    expect(current.confirmed.personalAccentColor).toBe(defaultPersonalPreferences.personalAccentColor)
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
    await act(async () => renderHook(async () => ({ ...defaultPersonalPreferences, mediaDetailNavigationWrap: true })))
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
