import { describe, expect, it, vi } from "vitest"
import { deleteGroupThenRefresh } from "./groupDeleteFlow"

describe("confirmed Group deletion and list refresh (G-17, issue #297)", () => {
  it("clears selection after confirmed deletion and initiates a list refresh", async () => {
    const events: string[] = []
    await deleteGroupThenRefresh({
      deleteGroup: async () => {
        events.push("deleted")
      },
      onDeleted: () => {
        events.push("cleared")
      },
      refreshGroups: async () => {
        events.push("refresh")
      },
    })
    await vi.waitFor(() =>
      expect(events).toEqual(["deleted", "cleared", "refresh"]),
    )
  })

  it("does not change deletion success into failure when the listing refresh rejects", async () => {
    const refreshGroups = vi.fn(async () => {
      throw new Error("list unavailable")
    })
    const onDeleted = vi.fn()
    await expect(
      deleteGroupThenRefresh({
        deleteGroup: async () => {},
        onDeleted,
        refreshGroups,
      }),
    ).resolves.toBeUndefined()
    await vi.waitFor(() => expect(refreshGroups).toHaveBeenCalledOnce())
    expect(onDeleted).toHaveBeenCalledOnce()
  })

  it("does not clear selection or refresh when the deletion mutation fails", async () => {
    const onDeleted = vi.fn()
    const refreshGroups = vi.fn(async () => {})
    await expect(
      deleteGroupThenRefresh({
        deleteGroup: async () => {
          throw new Error("mutation failed")
        },
        onDeleted,
        refreshGroups,
      }),
    ).rejects.toThrow("mutation failed")
    expect(onDeleted).not.toHaveBeenCalled()
    expect(refreshGroups).not.toHaveBeenCalled()
  })

  it("does not block deletion success on a slow subsequent list refresh", async () => {
    const refreshGroups = vi.fn(() => new Promise<void>(() => {}))
    const onDeleted = vi.fn()
    await expect(
      deleteGroupThenRefresh({
        deleteGroup: async () => {},
        onDeleted,
        refreshGroups,
      }),
    ).resolves.toBeUndefined()
    expect(onDeleted).toHaveBeenCalledOnce()
    await vi.waitFor(() => expect(refreshGroups).toHaveBeenCalledOnce())
  })
})
