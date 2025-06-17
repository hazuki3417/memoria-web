import { describe, expect, it } from "vitest";
import { taskReducer, type TaskAction, type TaskState } from "./taskReducer";

const initialState: TaskState = {
  current: { tasks: [] },
  meta: { action: "reset" },
};

const sampleTask = { id: "1", status: "idle" } as const;

describe("taskReducer", () => {
  it("should add tasks", () => {
    const action: TaskAction = {
      type: "add",
      payload: [sampleTask],
    };

    const actual = taskReducer(initialState, action);

    expect(actual.current.tasks).toHaveLength(1);
    expect(actual.current.tasks[0]).toEqual(sampleTask);
    expect(actual.meta.action).toBe("add");
  });

  it("should update a task", () => {
    const state: TaskState = {
      current: { tasks: [sampleTask] },
      meta: { action: "add" },
    };

    const action: TaskAction = {
      type: "update",
      key: { id: "1" },
      payload: { status: "running" },
    };

    const actual = taskReducer(state, action);

    expect(actual.current.tasks[0].status).toBe("running");
    expect(actual.meta.action).toBe("update");
  });

  it("should remove tasks by ids", () => {
    const state: TaskState = {
      current: { tasks: [sampleTask, { id: "2", status: "success" }] },
      meta: { action: "add" },
    };

    const action: TaskAction = {
      type: "remove",
      key: ["1"],
    };

    const actual = taskReducer(state, action);

    expect(actual.current.tasks).toHaveLength(1);
    expect(actual.current.tasks[0].id).toBe("2");
    expect(actual.meta.action).toBe("remove");
  });

  it("should reset tasks", () => {
    const state: TaskState = {
      current: { tasks: [sampleTask] },
      meta: { action: "add" },
    };

    const actual = taskReducer(state, { type: "reset" });

    expect(actual.current.tasks).toEqual([]);
    expect(actual.meta.action).toBe("reset");
  });

  it("should throw error on unknown action", () => {
    const state = initialState;

    expect(() => {
      taskReducer(
        state,
        // @ts-expect-error: intentionally testing invalid action
        { type: "unknown" } as TaskAction,
      );
    }).toThrowError();
  });
});
