import { ActionType, assertUnreachableActionType } from "./util";

export type TaskStatus = "idle" | "running" | "success" | "error";
export type TaskBase = {
  id: string;
  status: TaskStatus;
  error?: string;
};
export type Task<D = undefined> = D extends undefined
  ? TaskBase
  : TaskBase & { data: D };

export type TaskActionType = "add" | "update" | "remove" | "reset";
export interface TaskState<D = undefined> {
  current: {
    tasks: Task<D>[];
  };
  meta: {
    action: ActionType<TaskActionType>;
  };
}

export type TaskAction<D = undefined> =
  | { type: "add"; payload: Task<D>[] }
  | {
      type: "update";
      key: TaskBase["id"];
      payload: Partial<Omit<Task<D>, "id">>;
    }
  | { type: "remove"; key: TaskBase["id"][] }
  | { type: "reset" };

export const taskReducer = <D = undefined>(
  state: TaskState<D>,
  action: TaskAction<D>,
): TaskState<D> => {
  switch (action.type) {
    case "add":
      return {
        ...state,
        current: { tasks: [...state.current.tasks, ...action.payload] },
        meta: { action: "add" },
      };
    case "update":
      return {
        ...state,
        current: {
          tasks: state.current.tasks.map((task) =>
            task.id === action.key ? { ...task, ...action.payload } : task,
          ),
        },
        meta: { action: "update" },
      };
    case "remove":
      return {
        ...state,
        current: {
          tasks: state.current.tasks.filter(
            (task) => !action.key.includes(task.id),
          ),
        },
        meta: { action: "remove" },
      };
    case "reset":
      return {
        ...state,
        current: { tasks: [] },
        meta: { action: "reset" },
      };
    default:
      throw assertUnreachableActionType(action);
  }
};
