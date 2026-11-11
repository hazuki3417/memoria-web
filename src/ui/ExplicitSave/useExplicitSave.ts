"use client"

import { useEffect, useRef, useState } from "react"
import type { FormInputViolation } from "../formValidation"
import type { SaveActionResult } from "@/ui/SaveAction"

export type ExplicitSaveStatus = "idle" | "saving" | "retryable" | "blocked" | "unknown"


export type ExplicitSaveInspection<T> =
  | { status: "idle" | "checking" | "failed" }
  | { status: "matches" | "differs"; value: T }

/**
 * Coordinates one user-triggered save and its explicit recovery.
 * RHF, normalization, field errors and remote integration remain with the caller.
 */
export function useExplicitSave<T>({
  draft,
  changed,
  invalid,
  readDraft,
  action,
  inspect,
  adopt,
  onValidation,
  onConfirmed,
  initialStatus = "idle",
}: {
  draft: T
  changed: boolean
  invalid: boolean
  readDraft: () => T
  action: (value: T) => Promise<SaveActionResult<T>>
  inspect?: () => Promise<T>
  adopt: (value: T) => void
  onValidation: (violations: ReadonlyArray<FormInputViolation> | null) => void
  onConfirmed: (value: T) => void
  initialStatus?: ExplicitSaveStatus
}) {
  const [status, setStatus] = useState<ExplicitSaveStatus>(initialStatus)
  const [inspection, setInspection] = useState<ExplicitSaveInspection<T>>({ status: "idle" })
  const [blockedFeedback, setBlockedFeedback] = useState<{
    title: string
    description: string
  } | null>(null)
  const inspectionGeneration = useRef(0)
  const pendingSave = useRef(false)

  useEffect(() => () => { inspectionGeneration.current += 1 }, [])

  const isSaving = status === "saving"
  const isBlocked = status === "blocked"
  const isUnknown = status === "unknown"
  const canResaveInspected =
    isUnknown &&
    inspection.status === "differs" &&
    !invalid &&
    !Object.is(draft, inspection.value)
  const canSubmit = changed && !invalid && !isSaving && !isBlocked && !isUnknown
  const canSave = canSubmit || (canResaveInspected && !isSaving && !isBlocked)

  const save = async (value: T) => {
    if (!canSave || pendingSave.current || !Object.is(readDraft(), value)) return
    pendingSave.current = true
    const generation = ++inspectionGeneration.current
    setInspection({ status: "idle" })
    setBlockedFeedback(null)
    setStatus("saving")
    let result: SaveActionResult<T>
    try {
      result = await action(value)
    } catch {
      // Unexpected failures, including lost responses, do not prove rejection.
      result = { status: "unknown" }
    } finally {
      pendingSave.current = false
    }
    // The old Form may have unmounted during the request (e.g. a Context switch).
    if (generation !== inspectionGeneration.current) return
    switch (result.status) {
      case "confirmed":
        adopt(result.value)
        setStatus("idle")
        onConfirmed(result.value)
        break
      case "validation":
        onValidation(result.violations)
        setStatus("idle")
        break
      case "blocked":
        setBlockedFeedback(result.feedback)
        setStatus("blocked")
        break
      case "retryable":
      case "unknown":
        setStatus(result.status)
        break
    }
  }

  const inspectCurrent = async () => {
    if (!isUnknown || !inspect || inspection.status === "checking") return
    const generation = ++inspectionGeneration.current
    const draftAtStart = readDraft()
    setInspection({ status: "checking" })
    try {
      const observed = await inspect()
      if (
        generation !== inspectionGeneration.current ||
        !Object.is(readDraft(), draftAtStart)
      ) return
      setInspection({
        status: Object.is(observed, draftAtStart) ? "matches" : "differs",
        value: observed,
      })
    } catch {
      if (
        generation !== inspectionGeneration.current ||
        !Object.is(readDraft(), draftAtStart)
      ) return
      setInspection({ status: "failed" })
    }
  }

  const resetFromObservation = (expectedStatus: "matches" | "differs") => {
    if (!isUnknown || inspection.status !== expectedStatus) return
    if (inspection.status !== "matches" && inspection.status !== "differs") return
    if (expectedStatus === "matches" && !Object.is(inspection.value, readDraft())) return
    inspectionGeneration.current += 1
    adopt(inspection.value)
    setBlockedFeedback(null)
    setInspection({ status: "idle" })
    setStatus("idle")
  }

  const onDraftChange = () => {
    if (isUnknown) {
      inspectionGeneration.current += 1
      setInspection({ status: "idle" })
    }
  }

  return {
    status,
    inspection,
    blockedFeedback,
    isSaving,
    isBlocked,
    isUnknown,
    isInputDisabled: isSaving || isBlocked,
    canSubmit,
    canSave,
    canResaveInspected,
    save,
    inspectCurrent: inspect ? inspectCurrent : undefined,
    confirmObservation: () => resetFromObservation("matches"),
    discardUnconfirmed: () => resetFromObservation("differs"),
    onDraftChange,
  }
}
