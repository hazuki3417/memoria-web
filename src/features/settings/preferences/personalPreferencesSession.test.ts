import { describe, expect, it, vi } from "vitest"
import { createPersonalPreferencesSession } from "./personalPreferencesSession"
import { defaultUserPreferences } from "./userPreferences"

const tick = async () => {
  await Promise.resolve()
  await Promise.resolve()
  await Promise.resolve()
}

describe("Personal Preferences session controller", () => {
  it("keeps pending and confirmed state after the route subscriber detaches", async () => {
    vi.useFakeTimers()
    try {
      const controller = createPersonalPreferencesSession()
      const onSave = vi.fn().mockResolvedValue({
        ...defaultUserPreferences, mediaDetailNavigationWrap: true,
      })
      controller.configure(onSave, vi.fn())
      controller.hydrate(defaultUserPreferences)
      const listener = vi.fn()
      const unsubscribe = controller.subscribe(listener)
      controller.edit({ mediaDetailNavigationWrap: true })
      unsubscribe()
      await vi.advanceTimersByTimeAsync(400)
      expect(onSave).toHaveBeenCalledTimes(1)
      expect(controller.getSnapshot()).toMatchObject({
        confirmed: { mediaDetailNavigationWrap: true },
        saveStatus: "saved",
      })
    } finally {
      vi.useRealTimers()
    }
  })

  it("ignores stale server values until a query echoes the local confirmed field", async () => {
    vi.useFakeTimers()
    try {
      const controller = createPersonalPreferencesSession()
      controller.configure(vi.fn().mockResolvedValue({
        ...defaultUserPreferences, fileSizeUnit: "BINARY",
      }))
      controller.hydrate(defaultUserPreferences)
      controller.edit({ fileSizeUnit: "BINARY" })
      await vi.advanceTimersByTimeAsync(400)
      controller.hydrate(defaultUserPreferences)
      expect(controller.getSnapshot().confirmed?.fileSizeUnit).toBe("BINARY")
      controller.hydrate({ ...defaultUserPreferences, fileSizeUnit: "BINARY" })
      expect(controller.getSnapshot().confirmed?.fileSizeUnit).toBe("BINARY")
    } finally {
      vi.useRealTimers()
    }
  })

  it("stores incomplete ColorInput Draft without sending a mutation", async () => {
    const controller = createPersonalPreferencesSession()
    const save = vi.fn()
    controller.configure(save)
    controller.hydrate(defaultUserPreferences)
    controller.editAccentDraft("#12")
    expect(controller.getSnapshot().accentDraft).toBe("#12")
    expect(save).not.toHaveBeenCalled()
  })

  it("halts an unknown save until a successful query and manual retry", async () => {
    vi.useFakeTimers()
    try {
      const controller = createPersonalPreferencesSession()
      const save = vi.fn()
        .mockRejectedValueOnce(Object.assign(new Error("transport"), {
          networkError: new Error("offline"),
        }))
        .mockResolvedValue({
          ...defaultUserPreferences, mediaDetailNavigationWrap: true,
        })
      const inspect = vi.fn().mockResolvedValue(defaultUserPreferences)
      controller.configure(save, inspect)
      controller.hydrate(defaultUserPreferences)
      controller.edit({ mediaDetailNavigationWrap: true })
      await vi.advanceTimersByTimeAsync(400)
      expect(controller.getSnapshot()).toMatchObject({
        failure: "unknown", saveStatus: "attention", inspected: false,
      })
      controller.edit({ mediaThumbnailSize: "LARGE" })
      await vi.advanceTimersByTimeAsync(400)
      expect(save).toHaveBeenCalledTimes(1)
      controller.retry()
      expect(save).toHaveBeenCalledTimes(1)
      await controller.inspect()
      expect(controller.getSnapshot()).toMatchObject({
        inspected: true, observedMatches: false,
      })
      controller.retry()
      await tick()
      expect(save).toHaveBeenCalledTimes(2)
      expect(save).toHaveBeenLastCalledWith({
        mediaDetailNavigationWrap: true,
        mediaThumbnailSize: "LARGE",
      })
    } finally {
      vi.useRealTimers()
    }
  })

  it("confirms a matching current query without retransmitting the old mutation", async () => {
    vi.useFakeTimers()
    try {
      const controller = createPersonalPreferencesSession()
      const save = vi.fn().mockRejectedValueOnce(
        Object.assign(new Error("connection"), { networkError: new Error("offline") }),
      )
      controller.configure(save, vi.fn().mockResolvedValue({
        ...defaultUserPreferences, mediaDetailNavigationWrap: true,
      }))
      controller.hydrate(defaultUserPreferences)
      controller.edit({ mediaDetailNavigationWrap: true })
      await vi.advanceTimersByTimeAsync(400)
      await controller.inspect()
      expect(controller.getSnapshot().observedMatches).toBe(true)
      controller.confirmObservation()
      expect(controller.getSnapshot()).toMatchObject({
        failure: null, saveStatus: "idle", draftPatch: {},
      })
      expect(save).toHaveBeenCalledTimes(1)
    } finally {
      vi.useRealTimers()
    }
  })

  it("ignores superseded inspection errors for the same Preferences draft", async () => {
    vi.useFakeTimers()
    try {
      const controller = createPersonalPreferencesSession()
      let rejectFirst: ((error: Error) => void) | undefined
      const inspect = vi.fn()
        .mockImplementationOnce(() => new Promise((_, reject) => {
          rejectFirst = reject
        }))
        .mockResolvedValue({
          ...defaultUserPreferences, mediaDetailNavigationWrap: true,
        })
      controller.configure(
        vi.fn().mockRejectedValue(
          Object.assign(new Error("offline"), { networkError: new Error("offline") }),
        ),
        inspect,
      )
      controller.hydrate(defaultUserPreferences)
      controller.edit({ mediaDetailNavigationWrap: true })
      await vi.advanceTimersByTimeAsync(400)
      const older = controller.inspect()
      await controller.inspect()
      expect(controller.getSnapshot()).toMatchObject({
        inspected: true, observedMatches: true,
      })
      rejectFirst?.(new Error("old query failed"))
      await older
      expect(controller.getSnapshot()).toMatchObject({
        inspected: true, observedMatches: true,
      })
    } finally {
      vi.useRealTimers()
    }
  })

  it("does not roll back unrelated confirmed fields on an unknown outcome observation", async () => {
    vi.useFakeTimers()
    try {
      const controller = createPersonalPreferencesSession()
      const save = vi.fn()
        .mockResolvedValueOnce({ ...defaultUserPreferences, fileSizeUnit: "BINARY" })
        .mockRejectedValueOnce(Object.assign(new Error("offline"), {
          networkError: new Error("offline"),
        }))
      controller.configure(save, vi.fn().mockResolvedValue({
        ...defaultUserPreferences,
        mediaDetailNavigationWrap: true,
      }))
      controller.hydrate(defaultUserPreferences)
      controller.edit({ fileSizeUnit: "BINARY" })
      await vi.advanceTimersByTimeAsync(400)
      expect(controller.getSnapshot().confirmed?.fileSizeUnit).toBe("BINARY")
      controller.edit({ mediaDetailNavigationWrap: true })
      await vi.advanceTimersByTimeAsync(400)
      await controller.inspect()
      expect(controller.getSnapshot().observedMatches).toBe(true)
      controller.confirmObservation()
      expect(controller.getSnapshot()).toMatchObject({
        confirmed: {
          fileSizeUnit: "BINARY",
          mediaDetailNavigationWrap: true,
        },
        failure: null,
        draftPatch: {},
      })
    } finally {
      vi.useRealTimers()
    }
  })

  it("does not confirm a prior Preferences observation while a refresh is pending", async () => {
    vi.useFakeTimers()
    try {
      const controller = createPersonalPreferencesSession()
      let resolveRefresh: ((value: typeof defaultUserPreferences) => void) | undefined
      const inspect = vi.fn()
        .mockResolvedValueOnce({ ...defaultUserPreferences, mediaDetailNavigationWrap: true })
        .mockImplementationOnce(() => new Promise((resolve) => { resolveRefresh = resolve }))
      controller.configure(
        vi.fn().mockRejectedValue(
          Object.assign(new Error("offline"), { networkError: new Error("offline") }),
        ),
        inspect,
      )
      controller.hydrate(defaultUserPreferences)
      controller.edit({ mediaDetailNavigationWrap: true })
      await vi.advanceTimersByTimeAsync(400)
      await controller.inspect()
      expect(controller.getSnapshot().observedMatches).toBe(true)
      const pending = controller.inspect()
      expect(controller.getSnapshot()).toMatchObject({
        inspected: false, observedMatches: false,
      })
      controller.confirmObservation()
      expect(controller.getSnapshot().failure).toBe("unknown")
      resolveRefresh?.(defaultUserPreferences)
      await pending
      expect(controller.getSnapshot()).toMatchObject({
        inspected: true, observedMatches: false,
      })
    } finally {
      vi.useRealTimers()
    }
  })

  it("discards a failed Draft and restores a form reset revision", async () => {
    vi.useFakeTimers()
    try {
      const controller = createPersonalPreferencesSession()
      controller.configure(vi.fn().mockRejectedValue(new Error("unconfirmed")))
      controller.hydrate(defaultUserPreferences)
      controller.edit({ fileSizeUnit: "BINARY" })
      await vi.advanceTimersByTimeAsync(400)
      controller.discard()
      expect(controller.getSnapshot()).toMatchObject({
        failure: null, draftPatch: {}, discardRevision: 1,
      })
    } finally {
      vi.useRealTimers()
    }
  })
})
