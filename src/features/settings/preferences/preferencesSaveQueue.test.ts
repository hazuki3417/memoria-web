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
    expect(onError).toHaveBeenCalledWith(
      expect.any(Error),
      { personalAccentColor: selectedColor },
    )

    await queue.flush()
    expect(save).toHaveBeenCalledTimes(2)
    expect(save).toHaveBeenLastCalledWith({
      personalAccentColor: selectedColor,
    })
  })
})
