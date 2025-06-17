import { ActionType, assertUnreachableActionType } from "./util";

export type TaskStatus = "idle" | "running" | "success" | "error";
export type Task = {
  id: string;
  status: TaskStatus;
  error?: string;
};

export type TaskActionType = "add" | "update" | "remove" | "reset";
export interface TaskState {
  current: {
    tasks: Task[];
  };
  meta: {
    action: ActionType<TaskActionType>;
  };
}

export type TaskAction =
  | { type: "add"; payload: Task[] }
  | { type: "update"; key: Pick<Task, "id">; payload: Omit<Task, "id"> }
  | { type: "remove"; key: Task["id"][] }
  | { type: "reset" };

export const taskReducer = (
  state: TaskState,
  action: TaskAction,
): TaskState => {
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
            task.id === action.key.id ? { ...task, ...action.payload } : task,
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
