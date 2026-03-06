"use client"
import { Task, taskReducer } from "@/reducers"
import { ActionType } from "@/reducers/util"
import "client-only"
import { useCallback, useEffect, useReducer, useRef, useState } from "react"

export type UseTaskManagerOption<D = undefined> = {
  mode: "serial" | "parallel"
  failOnError?: boolean
}

export type UseTaskManagerValue<D = undefined> = {
  tasks: Task<D>[]
  meta: {
    action: UseTaskManagerActionState
  }
}

export type UseTaskManagerActionState = ActionType<
  "append" | "remove" | "reset" | "submit"
>

export type Process<D> = (task: Task<D>, index: number) => Promise<void>

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
  option: UseTaskManagerOption<D>,
): UseTaskManager<D> => {
  const { mode, failOnError = false } = option

  const [value, dispatch] = useReducer(taskReducer<D>, {
    current: { tasks: [] },
    meta: { action: "idle" },
  })

  const [action, setAction] = useState<UseTaskManagerActionState>("idle")

  const tasksRef = useRef<Task<D>[]>([])

  useEffect(() => {
    tasksRef.current = value.current.tasks
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
      await callback(task, index)
      setSuccess(task.id)
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
    value: { tasks: value.current.tasks, meta: { action } },
    action: {
      append,
      remove,
      reset,
      submit,
    },
  }
}
