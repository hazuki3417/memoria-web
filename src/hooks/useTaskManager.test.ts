import { useTaskManager } from "@/hooks";
import type { Task } from "@/reducers";
import { act, renderHook } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

describe("useTaskManager", () => {
  it("should append tasks", () => {
    const { result } = renderHook(() =>
      useTaskManager({ mode: "serial", failOnError: false }),
    )

    const task1: Task = { id: "1", status: "idle" }
    const task2: Task = { id: "2", status: "idle" }

    act(() => {
      result.current.action.append([task1, task2])
    })

    expect(result.current.value.tasks).toHaveLength(2)
    expect(result.current.value.tasks[0].id).toBe("1")
    expect(result.current.value.meta.action).toBe("append")
  })

  it("should remove tasks by id", () => {
    const { result } = renderHook(() =>
      useTaskManager({ mode: "serial", failOnError: false }),
    )

    const task1: Task = { id: "1", status: "idle" }
    const task2: Task = { id: "2", status: "idle" }

    act(() => {
      result.current.action.append([task1, task2])
      result.current.action.remove(["1"])
    })

    expect(result.current.value.tasks).toHaveLength(1)
    expect(result.current.value.tasks[0].id).toBe("2")
    expect(result.current.value.meta.action).toBe("remove")
  })

  it("should reset tasks", () => {
    const { result } = renderHook(() =>
      useTaskManager({ mode: "serial", failOnError: false }),
    )

    act(() => {
      result.current.action.append([{ id: "1", status: "idle" }])
      result.current.action.reset()
    })

    expect(result.current.value.tasks).toHaveLength(0)
    expect(result.current.value.meta.action).toBe("reset")
  })

  it("should submit tasks serially", async () => {
    const { result } = renderHook(() =>
      useTaskManager({ mode: "serial", failOnError: false }),
    )

    act(() => {
      result.current.action.append([
        { id: "1", status: "idle" },
        { id: "2", status: "idle" },
      ])
    })

    const mockProcess = vi.fn(async () => {
      await new Promise((res) => setTimeout(res, 5))
    })

    await act(async () => {
      await result.current.action.submit(mockProcess)
    })

    const statuses = result.current.value.tasks.map((t) => t.status)
    expect(statuses).toEqual(["success", "success"])
    expect(result.current.value.meta.action).toBe("submit")
  })

  it("should submit tasks in parallel", async () => {
    const { result } = renderHook(() =>
      useTaskManager({ mode: "parallel", failOnError: false }),
    )

    act(() => {
      result.current.action.append([
        { id: "1", status: "idle" },
        { id: "2", status: "idle" },
        { id: "3", status: "idle" },
      ])
    })

    const mockProcess = vi.fn(async () => {
      await new Promise((res) => setTimeout(res, 5))
    })

    await act(async () => {
      await result.current.action.submit(mockProcess)
    })

    const statuses = result.current.value.tasks.map((t) => t.status)
    expect(statuses).toEqual(["success", "success", "success"])
  })

  it("should stop on first error in serial mode if failOnError=true", async () => {
    const { result } = renderHook(() =>
      useTaskManager({ mode: "serial", failOnError: true }),
    )

    act(() => {
      result.current.action.append([
        { id: "1", status: "idle" },
        { id: "2", status: "idle" },
      ])
    })

    const mockProcess = vi.fn(async (task: Task) => {
      if (task.id === "2") {
        throw new Error("Failed at task 2")
      }
    })

    await act(async () => {
      await expect(result.current.action.submit(mockProcess)).rejects.toThrow(
        "Task 2 failed",
      )
    })

    const statuses = result.current.value.tasks.map((t) => t.status)
    expect(statuses).toEqual(["success", "error"])
  })
})
