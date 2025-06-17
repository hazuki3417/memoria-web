import { renderHook, act } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { useTaskManager } from "@/hooks/useTaskManager"; // パス調整
import type { Task } from "@/reducers";

describe("useTaskManager", () => {
  it("should append tasks", () => {
    const { result } = renderHook(() =>
      useTaskManager({ mode: "serial", failOnError: false }),
    );

    const task1: Task = { id: "1", status: "idle" };
    const task2: Task = { id: "2", status: "idle" };

    act(() => {
      result.current.handler.append([task1, task2]);
    });

    expect(result.current.state.tasks).toHaveLength(2);
    expect(result.current.state.tasks[0].id).toBe("1");
    expect(result.current.state.meta.action).toBe("append");
  });

  it("should remove tasks by id", () => {
    const { result } = renderHook(() =>
      useTaskManager({ mode: "serial", failOnError: false }),
    );

    const task1: Task = { id: "1", status: "idle" };
    const task2: Task = { id: "2", status: "idle" };

    act(() => {
      result.current.handler.append([task1, task2]);
      result.current.handler.remove(["1"]);
    });

    expect(result.current.state.tasks).toHaveLength(1);
    expect(result.current.state.tasks[0].id).toBe("2");
    expect(result.current.state.meta.action).toBe("remove");
  });

  it("should reset tasks", () => {
    const { result } = renderHook(() =>
      useTaskManager({ mode: "serial", failOnError: false }),
    );

    act(() => {
      result.current.handler.append([{ id: "1", status: "idle" }]);
      result.current.handler.reset();
    });

    expect(result.current.state.tasks).toHaveLength(0);
    expect(result.current.state.meta.action).toBe("reset");
  });

  it("should submit tasks serially", async () => {
    const { result } = renderHook(() =>
      useTaskManager({ mode: "serial", failOnError: false }),
    );

    act(() => {
      result.current.handler.append([
        { id: "1", status: "idle" },
        { id: "2", status: "idle" },
      ]);
    });

    const mockProcess = vi.fn(async () => {
      await new Promise((res) => setTimeout(res, 5));
    });

    await act(async () => {
      await result.current.handler.submit(mockProcess);
    });

    const statuses = result.current.state.tasks.map((t) => t.status);
    expect(statuses).toEqual(["success", "success"]);
    expect(result.current.state.meta.action).toBe("submit");
  });

  it("should submit tasks in parallel", async () => {
    const { result } = renderHook(() =>
      useTaskManager({ mode: "parallel", failOnError: false }),
    );

    act(() => {
      result.current.handler.append([
        { id: "1", status: "idle" },
        { id: "2", status: "idle" },
        { id: "3", status: "idle" },
      ]);
    });

    const mockProcess = vi.fn(async () => {
      await new Promise((res) => setTimeout(res, 5));
    });

    await act(async () => {
      await result.current.handler.submit(mockProcess);
    });

    const statuses = result.current.state.tasks.map((t) => t.status);
    expect(statuses).toEqual(["success", "success", "success"]);
  });

  it("should stop on first error in serial mode if failOnError=true", async () => {
    const { result } = renderHook(() =>
      useTaskManager({ mode: "serial", failOnError: true }),
    );

    act(() => {
      result.current.handler.append([
        { id: "1", status: "idle" },
        { id: "2", status: "idle" },
      ]);
    });

    const mockProcess = vi.fn(async (task: Task) => {
      if (task.id === "2") {
        throw new Error("Failed at task 2");
      }
    });

    await act(async () => {
      await expect(result.current.handler.submit(mockProcess)).rejects.toThrow(
        "Task 2 failed",
      );
    });

    const statuses = result.current.state.tasks.map((t) => t.status);
    expect(statuses).toEqual(["success", "error"]);
  });
});
