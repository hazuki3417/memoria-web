"use client"

import { useEffect, useRef, useState, type ChangeEvent } from "react"
import { useController, useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import type { z } from "zod"
import { resolveFormFailureValidation } from "@/ui/formValidation"
import { useExplicitSave, resolveConfirmedSourceSync } from "@/ui/ExplicitSave"
import type { SaveActionResult } from "@/ui/SaveAction"
import { profileSchema } from "./profileSchema"
import { showNotification } from "@/components/Feedback"

export type SaveProfile = (nickname: string) => Promise<SaveActionResult<string>>
export type InspectProfile = () => Promise<string>

type ProfileInspection =
  | { status: "idle" | "checking" | "failed" }
  | { status: "matches" | "differs"; nickname: string }

/** Owns Profile RHF, its confirmed baseline and server refresh synchronization. */
export function useProfileForm({
  onSave,
  onInspect,
  initialNickname,
  initialSaveState,
}: {
  onSave: SaveProfile
  onInspect?: InspectProfile
  initialNickname: string
  initialSaveState: "idle" | "saving" | "retryable-error" | "blocked"
}) {
  const {
    control,
    reset,
    getValues,
    handleSubmit,
    setError,
    clearErrors,
    formState: { isSubmitted },
  } = useForm<
    z.input<typeof profileSchema>,
    unknown,
    z.output<typeof profileSchema>
  >({
    resolver: zodResolver(profileSchema),
    mode: "onChange",
    defaultValues: { nickname: initialNickname },
  })
  const { field, fieldState } = useController({ control, name: "nickname" })
  const saved = useRef(initialNickname)
  const previousSourceNickname = useRef(initialNickname)
  const awaitingSourceEcho = useRef<string | null>(null)
  const [formInvalid, setFormInvalid] = useState(false)

  const validation = profileSchema.safeParse({ nickname: field.value })
  const normalized = field.value.trim()
  const dirty = normalized !== saved.current
  const invalid = !validation.success

  const adoptNickname = (nickname: string) => {
    saved.current = nickname
    awaitingSourceEcho.current = initialNickname === nickname ? null : nickname
    reset({ nickname })
    setFormInvalid(false)
    clearErrors("nickname")
  }

  const saveAction = useExplicitSave({
    draft: normalized,
    changed: dirty,
    invalid,
    readDraft: () => getValues("nickname").trim(),
    action: onSave,
    inspect: onInspect,
    adopt: adoptNickname,
    onValidation: (violations) => {
      const result = resolveFormFailureValidation(violations, ["nickname"])
      if (result.fieldErrors.nickname) {
        setError("nickname", {
          type: "server",
          message: result.fieldErrors.nickname,
        })
      }
      setFormInvalid(result.formError)
    },
    onConfirmed: () => {
      showNotification({
        kind: "success",
        title: "プロフィールを保存",
        description: "プロフィールを更新しました。",
      })
    },
    initialStatus:
      initialSaveState === "retryable-error" ? "retryable" : initialSaveState,
  })

  // Untouched Draft follows fresh data; edited/failed Draft and confirmed
  // values are protected from stale Query echoes.
  useEffect(() => {
    if (previousSourceNickname.current === initialNickname) return
    previousSourceNickname.current = initialNickname
    const decision = resolveConfirmedSourceSync({
      source: initialNickname,
      expectedEcho: awaitingSourceEcho.current,
      baseline: saved.current,
      draft: getValues("nickname").trim(),
      isUnknown: saveAction.isUnknown,
      canResetDraft: !saveAction.isSaving && saveAction.status !== "retryable",
    })
    if (!decision.adopt) return
    awaitingSourceEcho.current = null
    saved.current = initialNickname
    if (decision.resetDraft) reset({ nickname: initialNickname })
  }, [initialNickname, getValues, reset, saveAction.status, saveAction.isSaving, saveAction.isUnknown])

  const onDraftChange = (event: ChangeEvent<HTMLInputElement>) => {
    field.onChange(event)
    clearErrors("nickname")
    saveAction.onDraftChange()
  }

  const submit = handleSubmit(async ({ nickname }) => {
    if (!saveAction.canSave) return
    setFormInvalid(false)
    clearErrors("nickname")
    await saveAction.save(nickname)
  })

  let saveLabel = "更新"
  if (saveAction.status === "retryable") saveLabel = "再試行"
  else if (saveAction.isSaving) saveLabel = "更新中"

  const inspection: ProfileInspection =
    saveAction.inspection.status === "matches" ||
    saveAction.inspection.status === "differs"
      ? {
          status: saveAction.inspection.status,
          nickname: saveAction.inspection.value,
        }
      : { status: saveAction.inspection.status }

  return {
    field,
    fieldState,
    validation,
    normalized,
    dirty,
    invalid,
    canSubmit: saveAction.canSubmit,
    showClientError: fieldState.isTouched || isSubmitted,
    isSaving: saveAction.isSaving,
    isInputDisabled: saveAction.isInputDisabled,
    canResaveInspected: saveAction.canResaveInspected,
    saveLabel,
    formInvalid,
    failure: saveAction.failure,
    blockedFeedback: saveAction.blockedFeedback,
    inspection,
    save: submit,
    inspect: async () => { await saveAction.inspectCurrent?.() },
    confirmObservation: saveAction.confirmObservation,
    discardUnconfirmed: saveAction.discardUnconfirmed,
    onDraftChange,
  }
}
