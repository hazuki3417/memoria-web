"use client"
import { Task, taskReducer, TaskSummary, TaskValue } from "@/reducers"
import { ActionType } from "@/reducers/util"
import "client-only"
import {
  useCallback,
  useEffect,
  useMemo,
  useReducer,
  useRef,
  useState,
} from "react"

export type UseTaskManagerOption = {
  mode: "serial" | "parallel"
  failOnError?: boolean
}

export type UseTaskManagerTaskResult =
  | "idle"
  | "running"
  | "success"
  | "partial-success"
  | "error"

export type UseTaskManagerValue<D = undefined> = {
  tasks: Task<D>[]
  meta: {
    action: UseTaskManagerActionState
    result: UseTaskManagerTaskResult
    summary: TaskSummary
  }
}

export type UseTaskManagerActionState = ActionType<
  "append" | "remove" | "reset" | "submit"
>

type CallbackSuccessResult = {
  status: Extract<TaskValue, "success">
}

type CallbackSkipResult = {
  status: Extract<TaskValue, "skip">
}

type CallbackErrorResult = {
  status: Extract<TaskValue, "error">
  error: Error
}

export type Process<D> = (
  task: Task<D>,
  index: number,
) => Promise<CallbackSuccessResult | CallbackSkipResult | CallbackErrorResult>

export interface UseTaskManagerAction<D = undefined> {
  append: (task: Task<D>[]) => void
  remove: (key: string[]) => void
  reset: () => void
  submit: (process: Process<D>) => Promise<void>
}
export interface UseTaskManager<D = undefined> {
  value: UseTaskManagerValue<D>
  action: UseTaskManagerAction<D>
}

export const useTaskManager = <D = undefined>(
  option: UseTaskManagerOption,
): UseTaskManager<D> => {
  const { mode, failOnError = false } = option

  const [value, dispatch] = useReducer(taskReducer<D>, {
    current: { tasks: [] },
    meta: {
      action: "idle",
      summary: {
        total: 0,
        error: 0,
        idle: 0,
        running: 0,
        success: 0,
        skip: 0,
      },
    },
  })

  const [action, setAction] = useState<UseTaskManagerActionState>("idle")

  const tasksRef = useRef<Task<D>[]>([])

  useEffect(() => {
    tasksRef.current = value.current.tasks
  }, [value.current.tasks])

  const taskResult = useMemo(() => {
    return calcTaskResult(value.current.tasks)
  }, [value.current.tasks])

  const append = useCallback((task: Task<D>[]) => {
    setAction("append")
    dispatch({ type: "append", payload: task })
  }, [])

  const remove = useCallback((key: string[]) => {
    setAction("remove")
    dispatch({ type: "remove", key })
  }, [])

  const reset = useCallback(() => {
    setAction("reset")
    dispatch({ type: "reset" })
  }, [])

  const setRunning = useCallback((key: string) => {
    dispatch({
      type: "update",
      key,
      payload: {
        status: "running",
      },
    })
  }, [])

  const setSuccess = useCallback((key: string) => {
    dispatch({
      type: "update",
      key,
      payload: {
        status: "success",
      },
    })
  }, [])

  const setSkip = useCallback((key: string) => {
    dispatch({
      type: "update",
      key,
      payload: {
        status: "skip",
      },
    })
  }, [])

  const setError = useCallback((key: string, error?: string) => {
    dispatch({
      type: "update",
      key,
      payload: {
        status: "error",
        error,
      },
    })
  }, [])

  const runner = async (task: Task<D>, index: number, callback: Process<D>) => {
    setRunning(task.id)
    try {
      const result = await callback(task, index)
      switch (result.status) {
        case "success":
          setSuccess(task.id)
          break

        case "skip":
          setSkip(task.id)
          break
        case "error":
        default:
          throw result.error
      }
    } catch (err: any) {
      const message = err instanceof Error ? err.message : "Unknown error"
      setError(task.id, message)
      if (failOnError) throw new Error(`Task ${task.id} failed`)
    }
  }

  const serial = async (callback: Process<D>) => {
    const tasks = tasksRef.current
    for (let i = 0; i < tasks.length; i++) {
      const task = tasks[i]
      if (task.status === "success") continue
      await runner(task, i, callback)
    }
  }

  const parallel = async (callback: Process<D>) => {
    const tasks = tasksRef.current
    const promises = tasks
      .filter((task) => task.status !== "success")
      .map((task, index) => {
        runner(task, index, callback)
      })
    return await Promise.allSettled(promises)
  }

  const submit = async (process: Process<D>) => {
    setAction("submit")
    if (mode === "serial") {
      await serial(process)
    } else if (mode === "parallel") {
      await parallel(process)
    } else {
      throw new Error(`Unknown execution mode: ${mode}`)
    }
  }

  return {
    value: {
      tasks: value.current.tasks,
      meta: {
        action,
        result: taskResult,
        summary: value.meta.summary,
      },
    },
    action: {
      append,
      remove,
      reset,
      submit,
    },
  }
}

const calcTaskResult = (tasks: Task[]): UseTaskManagerTaskResult => {
  if (tasks.length === 0) return "idle"

  const success = tasks.filter((t) => t.status === "success").length
  const error = tasks.filter((t) => t.status === "error").length
  const running = tasks.filter((t) => t.status === "running").length
  const skip = tasks.filter((t) => t.status === "skip").length

  if (running > 0 || skip > 0) return "running"

  if (success + skip === tasks.length) return "success"

  if (error === tasks.length) return "error"

  if (success > 0 || error > 0) return "partial-success"

  return "idle"
}
