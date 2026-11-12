"use client"

import { useEffect, useRef, useState, useSyncExternalStore } from "react"
import type { Action } from "./actionOutcome"
import { createExplicitSaveProcess } from "./createExplicitSaveProcess"

/** 明示保存Processの生成・購読・終了をReactに接続する共通Hook。 */
export const useExplicitSaveProcess = <Input, Success, Rejection, Observed = never>({
  execute,
  recovery,
}: {
  execute: Action<Input, Success, Rejection>
  recovery?: {
    inspect: () => Promise<Observed>
    matches: (observed: Observed, submitted: Input) => boolean
  }
}) => {
  const executeRef = useRef(execute)
  const recoveryRef = useRef(recovery)

  useEffect(() => {
    executeRef.current = execute
    recoveryRef.current = recovery
  }, [execute, recovery])

  const executeLatest = (input: Input) => {
    return executeRef.current(input)
  }

  const inspectLatest = () => {
    const current = recoveryRef.current
    return current
      ? current.inspect()
      : Promise.reject(new Error("Inspection unavailable"))
  }

  const matchesLatest = (observed: Observed, input: Input) => {
    return recoveryRef.current?.matches(observed, input) ?? false
  }

  const createProcess = () => {
    return createExplicitSaveProcess<Input, Success, Rejection, Observed>({
      execute: executeLatest,
      recovery: recovery ? { inspect: inspectLatest, matches: matchesLatest } : undefined,
    })
  }

  const [process] = useState(createProcess)

  const snapshot = useSyncExternalStore(
    process.subscribe,
    process.getSnapshot,
    process.getSnapshot,
  )

  // StrictModeのEffect再実行では実際のUnmountまでProcessを閉じないようにする。
  const mounted = useRef(false)
  useEffect(() => {
    mounted.current = true
    return () => {
      mounted.current = false
      void Promise.resolve().then(() => {
        if (!mounted.current) process.close()
      })
    }
  }, [process])

  return { process, snapshot }
}
