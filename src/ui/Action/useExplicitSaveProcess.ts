"use client"

import { useEffect, useRef, useState, useSyncExternalStore } from "react"
import type { Action } from "./actionOutcome"
import { createExplicitSaveProcess } from "./createExplicitSaveProcess"

/**
 * React binding for the pure Process Factory.
 * All consumers get the same subscription, latest-callback and teardown
 * behavior without reimplementing lifecycle effects in their Features.
 */
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
  };

  const inspectLatest = () => {
    const current = recoveryRef.current
    return current
      ? current.inspect()
      : Promise.reject(new Error("Inspection unavailable"))
  };

  const matchesLatest = (observed: Observed, input: Input) => {
    return recoveryRef.current?.matches(observed, input) ?? false
  };

  const createProcess = () => {
    return createExplicitSaveProcess<Input, Success, Rejection, Observed>({
      execute: executeLatest,
      recovery: recovery ? { inspect: inspectLatest, matches: matchesLatest } : undefined,
    })
  };

  const [process] = useState(createProcess)

  const snapshot = useSyncExternalStore(
    process.subscribe,
    process.getSnapshot,
    process.getSnapshot,
  )

  // React StrictMode replays effect cleanup during development. Delay the
  // irreversible close for a microtask so that replay does not close the owner.
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
};
