"use client"

import { useEffect, useRef, useState, useSyncExternalStore, type ChangeEvent } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useController, useForm, useWatch } from "react-hook-form"
import type { z } from "zod"
import { showNotification } from "@/components/Feedback"
import { createExplicitSaveProcess } from "@/ui/Action"
import { resolveFormInputValidation } from "@/ui/formValidation"
import { profileSchema } from "./profileSchema"
import { getProfileBlockedFeedback } from "./profileBlockedFeedback"
import type { SaveProfile, ProfileSaveRejection } from "./profileSaveOutcome"

export type InspectProfile = () => Promise<string>

type SaveStatus =
  | { kind: "idle" | "saving" | "retryable-error" | "unknown" }
  | { kind: "blocked"; feedback: ReturnType<typeof getProfileBlockedFeedback> }

/** RHF owns form values; the injected process owns execution and inspection. */
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
  const dirty = normalized !== baseline.trim()
  const validation = profileSchema.safeParse({ nickname })
  const invalid = !validation.success

  const saveRef = useRef(onSave)
  const inspectRef = useRef(onInspect)
  saveRef.current = onSave
  inspectRef.current = onInspect

  const [process] = useState(() => createExplicitSaveProcess<string, string, ProfileSaveRejection, string>({
    execute: (input) => saveRef.current(input),
    recovery: {
      inspect: () => {
        if (!inspectRef.current) return Promise.reject(new Error("Profile inspection unavailable"))
        return inspectRef.current()
      },
      matches: (observed, submitted) => observed === submitted,
    },
  }))
  const processState = useSyncExternalStore(process.subscribe, process.getSnapshot, process.getSnapshot)

  const [status, setStatus] = useState<SaveStatus>(
    initialSaveState === "blocked"
      ? { kind: "blocked", feedback: getProfileBlockedFeedback(null, blockedMessage) }
      : { kind: initialSaveState },
  )
  const [formInvalid, setFormInvalid] = useState(false)
  const alive = useRef(true)
  const queryEcho = useRef({ observed: initialNickname, confirmed: null as string | null })

  useEffect(() => {
    alive.current = true
    return () => {
      alive.current = false
      process.close()
    }
  }, [process])

  useEffect(() => {
    if (queryEcho.current.observed === initialNickname) return
    queryEcho.current.observed = initialNickname
    if (queryEcho.current.confirmed !== null) {
      if (initialNickname !== queryEcho.current.confirmed) return
      queryEcho.current.confirmed = null
    }
    if (!form.formState.isDirty && !processState.busy && status.kind === "idle") {
      reset({ nickname: initialNickname })
    }
  }, [initialNickname, form.formState.isDirty, reset, processState.busy, status.kind])

  const saving = processState.busy || status.kind === "saving" || form.formState.isSubmitting
  const blocked = status.kind === "blocked"
  const unknown = status.kind === "unknown"
  const inspection = processState.inspection
  const canRetryInspected =
    unknown &&
    inspection.kind === "differs" &&
    !invalid &&
    normalized !== inspection.value

  function adopt(value: string) {
    process.invalidateInspection()
    queryEcho.current.confirmed = value === initialNickname ? null : value
    reset({ nickname: value })
    clearErrors()
    setFormInvalid(false)
    setStatus({ kind: "idle" })
  }

  const save = handleSubmit(async ({ nickname: input }) => {
    if (
      process.getSnapshot().busy ||
      blocked ||
      status.kind === "saving" ||
      (unknown && !canRetryInspected) ||
      (!dirty && !canRetryInspected)
    ) return

    setFormInvalid(false)
    clearErrors("nickname")
    const outcome = await process.submit(input)
    if (!alive.current || outcome === null) return

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
    if (!unknown || !onInspect || inspection.kind === "checking") return
    await process.inspect(getValues("nickname").trim())
  }

  function confirmObservedProfile() {
    if (
      unknown &&
      inspection.kind === "matches" &&
      getValues("nickname").trim() === inspection.value
    ) {
      // Current server observation is not proof of the earlier mutation.
      adopt(inspection.value)
    }
  }

  function discardUnconfirmedDraft() {
    if (unknown && inspection.kind === "differs") adopt(inspection.value)
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
      if (status.kind === "unknown") process.invalidateInspection()
    },
    inspectCurrentProfile,
    confirmObservedProfile,
    discardUnconfirmedDraft,
  }
}
