import { describe, expect, it, vi } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useTaskManager } from "./useTaskManager";
import { Task } from "@/reducers";

describe("useTaskManager", () => {
  const mockSuccessProcess = vi.fn().mockResolvedValue(undefined);
  const mockFailProcess = vi.fn().mockRejectedValue(new Error("fail"));

  const createTask = (id: string): Task => ({
    id,
    status: "idle"
  });

  it("should append tasks", () => {
    const { result } = renderHook(() =>
      useTaskManager({ mode: "serial", process: mockSuccessProcess, failOnError: false })
    );

    const task = createTask("1");

    act(() => {
      result.current.handler.append([task]);
    });

    expect(result.current.state.tasks).toHaveLength(1);
    expect(result.current.state.tasks[0].id).toBe("1");
    expect(result.current.state.meta.action).toBe("append");
  });

  it("should remove tasks", () => {
    const { result } = renderHook(() =>
      useTaskManager({ mode: "serial", process: mockSuccessProcess, failOnError: false })
    );

    const task1 = createTask("1");
    const task2 = createTask("2");

    act(() => {
      result.current.handler.append([task1, task2]);
    });

    act(() => {
      result.current.handler.remove(["1"]);
    });

    expect(result.current.state.tasks).toHaveLength(1);
    expect(result.current.state.tasks[0].id).toBe("2");
    expect(result.current.state.meta.action).toBe("remove");
  });

  it("should reset tasks", () => {
    const { result } = renderHook(() =>
      useTaskManager({ mode: "serial", process: mockSuccessProcess, failOnError: false })
    );

    const task1 = createTask("1");

    act(() => {
      result.current.handler.append([task1]);
      result.current.handler.reset();
    });

    expect(result.current.state.tasks).toHaveLength(0);
    expect(result.current.state.meta.action).toBe("reset");
  });

  it("should execute tasks serially", async () => {
    const process = vi.fn().mockResolvedValue(undefined);

    const { result } = renderHook(() =>
      useTaskManager({ mode: "serial", process, failOnError: false })
    );

    act(() => {
      result.current.handler.append([createTask("1"), createTask("2")]);
    });

    await act(() => result.current.handler.submit());

    expect(process).toHaveBeenCalledTimes(2);
    expect(result.current.state.meta.action).toBe("submit");
  });

  it("should execute tasks in parallel", async () => {
    const process = vi.fn().mockResolvedValue(undefined);

    const { result } = renderHook(() =>
      useTaskManager({ mode: "parallel", process, failOnError: false })
    );

    act(() => {
      result.current.handler.append([createTask("1"), createTask("2")]);
    });

    await act(() => result.current.handler.submit());

    expect(process).toHaveBeenCalledTimes(2);
    expect(result.current.state.meta.action).toBe("submit");
  });

  it("should fail on first error in serial mode when failOnError is true", async () => {
    const process = vi.fn().mockImplementation(async (task) => {
      if (task.id === "1") throw new Error("fail");
    });

    const { result } = renderHook(() =>
      useTaskManager({ mode: "serial", process, failOnError: true })
    );

    act(() => {
      result.current.handler.append([createTask("1"), createTask("2")]);
    });

    await expect(result.current.handler.submit()).rejects.toThrow("Task 1 failed");
  });

  it("should not fail on error when failOnError is false", async () => {
    const process = vi.fn().mockImplementation(async (task) => {
      if (task.id === "1") throw new Error("fail");
    });

    const { result } = renderHook(() =>
      useTaskManager({ mode: "serial", process, failOnError: false })
    );

    act(() => {
      result.current.handler.append([createTask("1"), createTask("2")]);
    });

    await expect(result.current.handler.submit()).resolves.toBeUndefined();
  });
});
