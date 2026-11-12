"use client"

import { useEffect, useRef, useState, type ChangeEvent } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useController, useForm, useWatch } from "react-hook-form"
import type { z } from "zod"
import { showNotification } from "@/components/Feedback"
import { resolveFormInputValidation } from "@/ui/formValidation"
import { profileSchema } from "./profileSchema"
import { getProfileBlockedFeedback } from "./profileBlockedFeedback"
import type { SaveProfile } from "./profileSaveOutcome"

export type InspectProfile = () => Promise<string>

type Inspection =
  | { kind: "idle" | "checking" | "failed" }
  | { kind: "matches" | "differs"; nickname: string }

type SaveStatus =
  | { kind: "idle" | "saving" | "retryable-error" | "unknown" }
  | { kind: "blocked"; feedback: ReturnType<typeof getProfileBlockedFeedback> }

export function useProfileForm({
  onSave,
  onInspect,
  initialNickname,
  initialSaveState = "idle",
  blockedMessage,
}: {
  onSave: SaveProfile
  onInspect?: InspectProfile
  initialNickname: string
  initialSaveState?: "idle" | "saving" | "retryable-error" | "blocked"
  blockedMessage: string
}) {
  const form = useForm<z.input<typeof profileSchema>, unknown, z.output<typeof profileSchema>>({
    resolver: zodResolver(profileSchema),
    mode: "onChange",
    defaultValues: { nickname: initialNickname },
  })
  const { control, reset, getValues, handleSubmit, setError, clearErrors } = form
  const { field, fieldState } = useController({ control, name: "nickname" })
  const nickname = useWatch({ control, name: "nickname" }) ?? initialNickname
  const normalized = nickname.trim()
  const baseline = form.formState.defaultValues?.nickname ?? initialNickname
  // Dirty is semantic: whitespace around an otherwise unchanged nickname is not a change.
  const dirty = normalized !== baseline.trim()
  const validation = profileSchema.safeParse({ nickname })
  const invalid = !validation.success

  const [status, setStatus] = useState<SaveStatus>(
    initialSaveState === "blocked"
      ? { kind: "blocked", feedback: getProfileBlockedFeedback(null, blockedMessage) }
      : { kind: initialSaveState },
  )
  const [inspection, setInspection] = useState<Inspection>({ kind: "idle" })
  const [formInvalid, setFormInvalid] = useState(false)

  // Non-form refs are limited to asynchronous operation lifetime/ordering
  // and server Query echo protection; RHF owns draft, errors, and baseline.
  const inFlight = useRef(false)
  const alive = useRef(true)
  const inspectVersion = useRef(0)
  const queryEcho = useRef({ observed: initialNickname, confirmed: null as string | null })

  useEffect(() => {
    alive.current = true
    return () => {
      alive.current = false
      inspectVersion.current += 1
    }
  }, [])

  useEffect(() => {
    if (queryEcho.current.observed === initialNickname) return
    queryEcho.current.observed = initialNickname
    if (queryEcho.current.confirmed !== null) {
      if (initialNickname !== queryEcho.current.confirmed) return
      queryEcho.current.confirmed = null
    }
    // Server data may refresh while editing; RHF remains authoritative for draft.
    if (!form.formState.isDirty && !inFlight.current && status.kind === "idle") {
      reset({ nickname: initialNickname })
    }
  }, [initialNickname, form.formState.isDirty, reset, status.kind])

  const saving = form.formState.isSubmitting || status.kind === "saving"
  const blocked = status.kind === "blocked"
  const unknown = status.kind === "unknown"
  const canRetryInspected =
    unknown &&
    inspection.kind === "differs" &&
    !invalid &&
    normalized !== inspection.nickname

  function adopt(nickname: string) {
    inspectVersion.current += 1
    queryEcho.current.confirmed = nickname === initialNickname ? null : nickname
    reset({ nickname })
    clearErrors()
    setFormInvalid(false)
    setInspection({ kind: "idle" })
    setStatus({ kind: "idle" })
  }

  const save = handleSubmit(async ({ nickname: confirmedInput }) => {
    if (
      inFlight.current || blocked || saving ||
      (unknown && !canRetryInspected) ||
      (!dirty && !canRetryInspected)
    ) return

    inFlight.current = true
    inspectVersion.current += 1
    setStatus({ kind: "saving" })
    setInspection({ kind: "idle" })
    setFormInvalid(false)
    clearErrors("nickname")

    // Action input is the normalized RHF snapshot. An exception without an
    // Outcome is not evidence that a remote mutation was rejected.
    let outcome: Awaited<ReturnType<SaveProfile>>
    try {
      outcome = await onSave(confirmedInput)
    } catch {
      outcome = { kind: "unknown" }
    } finally {
      inFlight.current = false
    }

    if (!alive.current) return
    if (outcome.kind === "success") {
      adopt(outcome.value)
      showNotification({
        kind: "success",
        title: "プロフィールを保存",
        description: "プロフィールを更新しました。",
      })
    } else if (outcome.kind === "unknown") {
      setStatus({ kind: "unknown" })
    } else {
      const reason = outcome.reason
      switch (reason.kind) {
        case "validation": {
          const errors = resolveFormInputValidation({ violations: reason.violations }, ["nickname"])
          if (errors.fieldErrors.nickname) {
            setError("nickname", { type: "server", message: errors.fieldErrors.nickname })
          }
          setFormInvalid(errors.formError)
          setStatus({ kind: "idle" })
          break
        }
        case "blocked":
          setStatus({
            kind: "blocked",
            feedback: getProfileBlockedFeedback(reason.error, blockedMessage),
          })
          break
        case "retryable":
          setStatus({ kind: "retryable-error" })
          break
      }
    }
  })

  async function inspectCurrentProfile() {
    if (!onInspect || !unknown || inspection.kind === "checking") return
    const version = ++inspectVersion.current
    const attempted = getValues("nickname").trim()
    setInspection({ kind: "checking" })
    try {
      const current = await onInspect()
      if (!alive.current || version !== inspectVersion.current || getValues("nickname").trim() !== attempted) return
      setInspection({ kind: current === attempted ? "matches" : "differs", nickname: current })
    } catch {
      if (!alive.current || version !== inspectVersion.current || getValues("nickname").trim() !== attempted) return
      setInspection({ kind: "failed" })
    }
  }

  function confirmObservedProfile() {
    if (unknown && inspection.kind === "matches" &&
      getValues("nickname").trim() === inspection.nickname) {
      // A matching observation is not proof that the previous mutation succeeded.
      adopt(inspection.nickname)
    }
  }

  function discardUnconfirmedDraft() {
    if (unknown && inspection.kind === "differs") adopt(inspection.nickname)
  }

  return {
    field,
    fieldState,
    validation,
    dirty,
    invalid,
    showClientError: fieldState.isTouched || form.formState.isSubmitted,
    saving,
    blocked,
    unknown,
    status,
    inspection,
    formInvalid,
    normalized,
    canRetryInspected,
    saveLabel: saving ? "更新中" : status.kind === "retryable-error" ? "再試行" : "更新",
    save,
    onDraftChange(event: ChangeEvent<HTMLInputElement>) {
      field.onChange(event)
      clearErrors("nickname")
      if (status.kind === "unknown") {
        inspectVersion.current += 1
        setInspection({ kind: "idle" })
      }
    },
    inspectCurrentProfile,
    confirmObservedProfile,
    discardUnconfirmedDraft,
  }
}
