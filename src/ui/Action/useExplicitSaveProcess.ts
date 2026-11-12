"use client"

import { useEffect, useRef, useState, useSyncExternalStore } from "react"
import type { Action } from "./actionOutcome"
import { createExplicitSaveProcess } from "./createExplicitSaveProcess"

/**
 * React binding for the pure Process Factory.
 * All consumers get the same subscription, latest-callback and teardown
 * behavior without reimplementing lifecycle effects in their Features.
 */
export function useExplicitSaveProcess<Input, Success, Rejection, Observed = never>({
  execute,
  recovery,
}: {
  execute: Action<Input, Success, Rejection>
  recovery?: {
    inspect: () => Promise<Observed>
    matches: (observed: Observed, submitted: Input) => boolean
  }
}) {
  const executeRef = useRef(execute)
  executeRef.current = execute
  const recoveryRef = useRef(recovery)
  recoveryRef.current = recovery

  const [process] = useState(() => createExplicitSaveProcess<Input, Success, Rejection, Observed>({
    execute: (input) => executeRef.current(input),
    recovery: recovery
      ? {
          inspect: () => {
            const current = recoveryRef.current
            return current
              ? current.inspect()
              : Promise.reject(new Error("Inspection unavailable"))
          },
          matches: (observed, input) =>
            recoveryRef.current?.matches(observed, input) ?? false,
        }
      : undefined,
  }))

  const snapshot = useSyncExternalStore(
    process.subscribe,
    process.getSnapshot,
    process.getSnapshot,
  )

  // In React StrictMode, Effect setup/cleanup is replayed in development.
  // Defer irreversible close one microtask so the replayed setup can retain
  // the same Process; a real unmount still releases the owner.
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
