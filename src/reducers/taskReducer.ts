import { ActionType, assertUnreachableActionType } from "./util"

export type TaskValue = "idle" | "running" | "success" | "error" | "skip"

export type TaskSummary = Record<TaskValue, number> & {
  total: number
}

export type TaskBase = {
  id: string
  status: TaskValue
  error?: string
}
export type Task<D = undefined> = D extends undefined
  ? TaskBase
  : TaskBase & { data: D }

export type TaskActionType = "append" | "update" | "remove" | "reset"
export interface TaskState<D = undefined> {
  current: {
    tasks: Task<D>[]
  }
  meta: {
    action: ActionType<TaskActionType>
    summary: TaskSummary
  }
}

export type TaskAction<D = undefined> =
  | { type: "append"; payload: Task<D>[] }
  | {
    type: "update"
    key: TaskBase["id"]
    payload: Pick<TaskBase, "status" | "error"> & { data?: D }
  }
  | { type: "remove"; key: TaskBase["id"][] }
  | { type: "reset" }

export const taskReducer = <D = undefined>(
  state: TaskState<D>,
  action: TaskAction<D>,
): TaskState<D> => {
  switch (action.type) {
    case "append": {
      const tasks = [...state.current.tasks, ...action.payload]
      return {
        ...state,
        current: { tasks },
        meta: { action: "append", summary: calcSummary(tasks) },
      }
    }
    case "update": {
      const tasks = state.current.tasks.map((task) => task.id === action.key ? { ...task, ...action.payload } : task)
      return {
        ...state,
        current: { tasks },
        meta: { action: "update", summary: calcSummary(tasks) },
      }
    }
    case "remove": {
      const tasks = state.current.tasks.filter((task) => !action.key.includes(task.id))
      return {
        ...state,
        current: { tasks },
        meta: { action: "remove", summary: calcSummary(tasks) },
      }
    }
    case "reset": {
      const tasks: Task<D>[] = []
      return {
        ...state,
        current: { tasks },
        meta: { action: "reset", summary: calcSummary([]) },
      }
    }
    default:
      throw assertUnreachableActionType(action)
  }
}


const calcSummary = <D>(tasks: Task<D>[]): TaskSummary => {

  const summary: TaskSummary = {
    total: tasks.length,
    idle: 0,
    running: 0,
    success: 0,
    error: 0,
    skip: 0
  }

  for (const task of tasks) {
    summary[task.status]++
  }

  return summary
}
