import { describe, expect, it } from "vitest";
import {
  taskReducer,
  type Task,
  type TaskAction,
  type TaskState,
} from "./taskReducer";

// Payloadの型
type UploadData = {
  fileName: string;
  size: number;
};

const initialState: TaskState<UploadData> = {
  current: { tasks: [] },
  meta: { action: "reset" },
};

const sampleTask: Task<UploadData> = {
  id: "upload-1",
  status: "idle",
  data: {
    fileName: "image.jpg",
    size: 1024,
  },
};

describe("taskReducer (with payload)", () => {
  it("should add tasks with payload", () => {
    const action: TaskAction<UploadData> = {
      type: "append",
      payload: [sampleTask],
    };

    const actual = taskReducer(initialState, action);

    expect(actual.current.tasks).toHaveLength(1);
    expect(actual.current.tasks[0]).toEqual(sampleTask);
    expect(actual.meta.action).toBe("append");
  });

  it("should update a task and preserve payload", () => {
    const state: TaskState<UploadData> = {
      current: { tasks: [sampleTask] },
      meta: { action: "append" },
    };

    const data: UploadData = {
      fileName: "example.png",
      size: 1000,
    };

    const action: TaskAction<UploadData> = {
      type: "update",
      key: "upload-1",
      payload: {
        status: "running",
        data,
      },
    };

    const actual = taskReducer(state, action);

    expect(actual.current.tasks[0].status).toBe("running");
    expect(actual.current.tasks[0].data).toEqual(data);
    expect(actual.meta.action).toBe("update");
  });

  it("should remove tasks by id", () => {
    const state: TaskState<UploadData> = {
      current: {
        tasks: [
          sampleTask,
          {
            id: "upload-2",
            status: "success",
            data: {
              fileName: "image2.jpg",
              size: 2048,
            },
          },
        ],
      },
      meta: { action: "append" },
    };

    const action: TaskAction<UploadData> = {
      type: "remove",
      key: ["upload-1"],
    };

    const actual = taskReducer(state, action);

    expect(actual.current.tasks).toHaveLength(1);
    expect(actual.current.tasks[0].id).toBe("upload-2");
    expect(actual.meta.action).toBe("remove");
  });

  it("should reset tasks with payload", () => {
    const state: TaskState<UploadData> = {
      current: { tasks: [sampleTask] },
      meta: { action: "append" },
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
        { type: "unknown" },
      );
    }).toThrowError();
  });
});
