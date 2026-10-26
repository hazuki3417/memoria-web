"use client"

import { useEffect, useRef, useState } from "react"
import { createPreferencesSaveQueue } from "./preferencesSaveQueue"
import type { UserPreferences, UserPreferencesPatch } from "./userPreferences"

type Save = (patch: UserPreferencesPatch) => Promise<UserPreferences>
type SaveError = "blocked" | "retryable" | null

/** Keeps the saving controller stable across renders; flushes edits on unmount. */
export function usePreferencesSave(onSave?: Save) {
  const [saveError, setSaveError] = useState<SaveError>(null)
  const saveRef = useRef(onSave)
  saveRef.current = onSave
  const controllerRef = useRef<ReturnType<
    typeof createPreferencesSaveQueue
  > | null>(null)

  useEffect(() => {
    if (!saveRef.current) return
    const controller = createPreferencesSaveQueue(
      (patch) => {
        const save = saveRef.current
        if (!save) throw new Error("Preferences save unavailable")
        return save(patch)
      },
      () => setSaveError(null),
      (error) =>
        setSaveError(
          typeof error === "object" &&
            error !== null &&
            "kind" in error &&
            error.kind === "blocked"
            ? "blocked"
            : "retryable",
        ),
    )
    controllerRef.current = controller
    return () => {
      // Flush without waiting for the component; the server action can finish
      // after navigation. Callbacks must not update an unmounted component.
      controller.flush()
      controllerRef.current = null
    }
  }, [])

  return {
    saveError,
    enqueue: (patch: UserPreferencesPatch) =>
      controllerRef.current?.enqueue(patch),
    retry: () => {
      setSaveError(null)
      void controllerRef.current?.flush()
    },
  }
}
