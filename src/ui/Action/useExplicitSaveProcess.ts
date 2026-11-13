"use client"

import { useEffect, useRef, useState, useSyncExternalStore } from "react"
import { createExplicitSaveProcess, type ExplicitSaveProcessConfig } from "./createExplicitSaveProcess"

/** 明示保存Processの操作と状態をReact画面から共通の方法で利用できるようにし、購読・終了処理の重複実装をなくす。 */
export const useExplicitSaveProcess = <Input, Success, Rejection, Observed = never>({
  execute,
  recovery,
}: ExplicitSaveProcessConfig<Input, Success, Rejection, Observed>) => {
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

  /** 保存操作・復旧照会を実行するProcessと、画面表示に利用する現在の実行状態を提供する。 */
  return { process, snapshot }
}
