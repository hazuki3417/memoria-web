import { afterEach, describe, expect, it, vi } from "vitest"
import { createPreferencesSaveQueue } from "./preferencesSaveQueue"
import { defaultUserPreferences } from "./userPreferences"

afterEach(() => vi.useRealTimers())

describe("preferences save queue", () => {
  it("debounces changes and combines patches", async () => {
    vi.useFakeTimers()
    const save = vi.fn().mockResolvedValue(defaultUserPreferences)
    const queue = createPreferencesSaveQueue(save, vi.fn(), vi.fn(), 400)
    queue.enqueue({ mediaDetailNavigationWrap: true })
    await vi.advanceTimersByTimeAsync(300)
    queue.enqueue({ mediaThumbnailSize: "LARGE" })
    await vi.advanceTimersByTimeAsync(399)
    expect(save).not.toHaveBeenCalled()
    await vi.advanceTimersByTimeAsync(1)
    expect(save).toHaveBeenCalledTimes(1)
    expect(save).toHaveBeenCalledWith({
      mediaDetailNavigationWrap: true,
      mediaThumbnailSize: "LARGE",
    })
  })

  it("flushes pending edits without waiting for the timer", async () => {
    vi.useFakeTimers()
    const save = vi.fn().mockResolvedValue(defaultUserPreferences)
    const queue = createPreferencesSaveQueue(save, vi.fn(), vi.fn())
    queue.enqueue({ mediaDetailInitialInfoWide: false })
    await queue.flush()
    expect(save).toHaveBeenCalledTimes(1)
  })

  it("retains failed edits for explicit retry", async () => {
    vi.useFakeTimers()
    const save = vi
      .fn()
      .mockRejectedValueOnce(new Error("network"))
      .mockResolvedValue(defaultUserPreferences)
    const onError = vi.fn()
    const queue = createPreferencesSaveQueue(save, vi.fn(), onError)
    queue.enqueue({ mediaDetailNavigationWrap: true })
    await vi.advanceTimersByTimeAsync(400)
    expect(onError).toHaveBeenCalledTimes(1)
    await queue.flush()
    expect(save).toHaveBeenCalledTimes(2)
    expect(save).toHaveBeenLastCalledWith({ mediaDetailNavigationWrap: true })
  })

  it("keeps the selected Personal Accent Color after a failed save and retries the same value", async () => {
    vi.useFakeTimers()
    const selectedColor = "#4287F5"
    const save = vi
      .fn()
      .mockRejectedValueOnce(new Error("network"))
      .mockResolvedValueOnce({
        ...defaultUserPreferences,
        personalAccentColor: selectedColor,
      })
    const onError = vi.fn()
    const queue = createPreferencesSaveQueue(save, vi.fn(), onError)
    queue.enqueue({ personalAccentColor: selectedColor })
    await vi.advanceTimersByTimeAsync(400)

    expect(onError).toHaveBeenCalledTimes(1)
    expect(onError).toHaveBeenCalledWith(expect.any(Error), {
      personalAccentColor: selectedColor,
    })

    await queue.flush()
    expect(save).toHaveBeenCalledTimes(2)
    expect(save).toHaveBeenLastCalledWith({
      personalAccentColor: selectedColor,
    })
  })
  it("keeps newer values when retrying after a failed save", async () => {
    vi.useFakeTimers()
    const save = vi
      .fn()
      .mockRejectedValueOnce(new Error("network"))
      .mockResolvedValue(defaultUserPreferences)
    const queue = createPreferencesSaveQueue(save, vi.fn(), vi.fn())

    queue.enqueue({
      personalAccentColor: "#111111",
      mediaThumbnailSize: "SMALL",
    })
    await vi.advanceTimersByTimeAsync(400)

    queue.enqueue({ personalAccentColor: "#222222" })
    await queue.flush()

    expect(save).toHaveBeenCalledTimes(2)
    expect(save).toHaveBeenLastCalledWith({
      personalAccentColor: "#222222",
      mediaThumbnailSize: "SMALL",
    })
  })

  it("saves changes queued during an in-flight request without dropping them", async () => {
    vi.useFakeTimers()
    let completeFirstSave:
      | ((value: typeof defaultUserPreferences) => void)
      | undefined
    const save = vi
      .fn()
      .mockImplementationOnce(
        () =>
          new Promise((resolve) => {
            completeFirstSave = resolve
          }),
      )
      .mockResolvedValue(defaultUserPreferences)
    const queue = createPreferencesSaveQueue(save, vi.fn(), vi.fn())

    queue.enqueue({ dateFormat: "DD_MM_YYYY" })
    const draining = queue.flush()
    expect(save).toHaveBeenCalledTimes(1)

    queue.enqueue({ mediaDetailInitialInfoMedium: true })
    completeFirstSave?.(defaultUserPreferences)
    await draining

    expect(save).toHaveBeenCalledTimes(2)
    expect(save).toHaveBeenNthCalledWith(1, { dateFormat: "DD_MM_YYYY" })
    expect(save).toHaveBeenNthCalledWith(2, {
      mediaDetailInitialInfoMedium: true,
    })
  })

  it("emits pending, saving and saved without changing patch coalescing", async () => {
    vi.useFakeTimers()
    const states: string[] = []
    const save = vi.fn().mockResolvedValue(defaultUserPreferences)
    const queue = createPreferencesSaveQueue(
      save,
      vi.fn(),
      vi.fn(),
      400,
      (state) => states.push(state),
    )

    queue.enqueue({ dateFormat: "DD_MM_YYYY" })
    queue.enqueue({ mediaThumbnailSize: "LARGE" })
    expect(states).toEqual(["pending", "pending"])
    await vi.advanceTimersByTimeAsync(400)

    expect(states).toEqual(["pending", "pending", "saving", "saved"])
    expect(save).toHaveBeenCalledTimes(1)
    expect(save).toHaveBeenCalledWith({
      dateFormat: "DD_MM_YYYY",
      mediaThumbnailSize: "LARGE",
    })
  })

  it("keeps saving status while newer edits remain in flight", async () => {
    vi.useFakeTimers()
    const states: string[] = []
    let completeFirst: ((value: typeof defaultUserPreferences) => void) | undefined
    const save = vi
      .fn()
      .mockImplementationOnce(
        () =>
          new Promise((resolve) => {
            completeFirst = resolve
          }),
      )
      .mockResolvedValue(defaultUserPreferences)
    const queue = createPreferencesSaveQueue(
      save,
      vi.fn(),
      vi.fn(),
      400,
      (state) => states.push(state),
    )

    queue.enqueue({ dateFormat: "MM_DD_YYYY" })
    const flush = queue.flush()
    queue.enqueue({ mediaDetailNavigationWrap: true })
    completeFirst?.(defaultUserPreferences)
    await flush

    expect(states.at(-1)).toBe("saved")
    expect(states.filter((state) => state === "saved")).toHaveLength(1)
    expect(save).toHaveBeenCalledTimes(2)
  })

  it("shows attention after the queue rejects a save", async () => {
    vi.useFakeTimers()
    const states: string[] = []
    const queue = createPreferencesSaveQueue(
      vi.fn().mockRejectedValue(new Error("network")),
      vi.fn(),
      vi.fn(),
      400,
      (state) => states.push(state),
    )
    queue.enqueue({ mediaDetailInitialInfoWide: true })
    await vi.advanceTimersByTimeAsync(400)
    expect(states.at(-1)).toBe("attention")
    expect(states).not.toContain("saved")
  })

  it("does not auto retry after failure even when new edits arrive", async () => {
    vi.useFakeTimers()
    const save = vi.fn()
      .mockRejectedValueOnce(new Error("offline"))
      .mockResolvedValue(defaultUserPreferences)
    const queue = createPreferencesSaveQueue(save, vi.fn(), vi.fn())
    queue.enqueue({ mediaDetailNavigationWrap: true })
    await vi.advanceTimersByTimeAsync(400)
    queue.enqueue({ mediaThumbnailSize: "LARGE" })
    await vi.advanceTimersByTimeAsync(2000)
    expect(save).toHaveBeenCalledTimes(1)
    expect(queue.getPending()).toEqual({
      mediaDetailNavigationWrap: true,
      mediaThumbnailSize: "LARGE",
    })
    await queue.flush()
    expect(save).toHaveBeenCalledTimes(2)
  })

  it("keeps attention visible when editing after a failed save", async () => {
    vi.useFakeTimers()
    const states: string[] = []
    const save = vi\n      .fn()\n      .mockRejectedValueOnce(new Error("offline"))\n      .mockResolvedValue(defaultUserPreferences)
    const queue = createPreferencesSaveQueue(
      save,
      vi.fn(),
      vi.fn(),
      400,
      (state) => states.push(state),
    )

    queue.enqueue({ mediaDetailNavigationWrap: true })
    await vi.advanceTimersByTimeAsync(400)
    expect(states.at(-1)).toBe("attention")

    queue.enqueue({ mediaThumbnailSize: "LARGE" })
    expect(states.at(-1)).toBe("attention")
    await vi.advanceTimersByTimeAsync(1000)
    expect(save).toHaveBeenCalledTimes(1)

    await queue.flush()
    expect(save).toHaveBeenCalledTimes(2)
    expect(states.at(-1)).toBe("saved")
  })

  it("preserves newer edits after an in-flight failure until explicit retry", async () => {
    vi.useFakeTimers()
    const states: string[] = []
    let rejectFirst: ((error: Error) => void) | undefined
    const save = vi
      .fn()
      .mockImplementationOnce(
        () =>
          new Promise<typeof defaultUserPreferences>((_resolve, reject) => {
            rejectFirst = reject
          }),
      )
      .mockResolvedValue(defaultUserPreferences)
    const queue = createPreferencesSaveQueue(
      save,
      vi.fn(),
      vi.fn(),
      400,
      (state) => states.push(state),
    )

    queue.enqueue({ mediaThumbnailSize: "SMALL", dateFormat: "DD_MM_YYYY" })
    const first = queue.flush()
    queue.enqueue({ mediaThumbnailSize: "LARGE" })
    rejectFirst?.(new Error("offline"))
    await first

    expect(queue.getPending()).toEqual({
      mediaThumbnailSize: "LARGE",
      dateFormat: "DD_MM_YYYY",
    })
    expect(states.at(-1)).toBe("attention")

    await vi.advanceTimersByTimeAsync(1000)
    expect(save).toHaveBeenCalledTimes(1)
    await queue.flush({ manual: false })
    expect(save).toHaveBeenCalledTimes(1)

    await queue.flush()
    expect(save).toHaveBeenCalledTimes(2)
    expect(save).toHaveBeenLastCalledWith({
      mediaThumbnailSize: "LARGE",
      dateFormat: "DD_MM_YYYY",
    })
    expect(states.at(-1)).toBe("saved")
  })

  it("does not resume a failed queue on an automatic unmount flush", async () => {
    vi.useFakeTimers()
    const save = vi.fn().mockRejectedValue(new Error("offline"))
    const queue = createPreferencesSaveQueue(save, vi.fn(), vi.fn())
    queue.enqueue({ mediaDetailInitialInfoWide: false })
    await vi.advanceTimersByTimeAsync(400)
    await queue.flush({ manual: false })
    expect(save).toHaveBeenCalledTimes(1)
  })

  it("does not save new edits after disposal", async () => {
    vi.useFakeTimers()
    const save = vi.fn().mockResolvedValue(defaultUserPreferences)
    const queue = createPreferencesSaveQueue(save, vi.fn(), vi.fn())

    queue.enqueue({ mediaThumbnailSize: "LARGE" })
    queue.dispose()
    queue.enqueue({ mediaThumbnailSize: "SMALL" })
    await vi.advanceTimersByTimeAsync(400)
    await queue.flush()

    expect(save).not.toHaveBeenCalled()
  })
})
