"use client"

import { useEffect, useRef, useState, type ChangeEvent } from "react"
import { useController, useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import type { z } from "zod"
import { resolveFormFailureValidation } from "@/ui/formValidation"
import { useExplicitSave, type ExplicitSaveResult } from "@/ui/ExplicitSave"
import { profileSchema } from "./profileSchema"
import { getProfileBlockedFeedback } from "./profileBlockedFeedback"
import { showNotification } from "@/components/Feedback"
import { classifySettingsSaveFailure, getSettingsInputViolations } from "@/infrastructure/graphql/settingsMutationResult"

export type SaveProfile = (nickname: string) => Promise<void>
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
  blockedMessage,
}: {
  onSave: SaveProfile
  onInspect?: InspectProfile
  initialNickname: string
  initialSaveState: "idle" | "saving" | "retryable-error" | "blocked"
  blockedMessage: string
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

  // Existing Story callbacks are throwing operations. Translate their meaning
  // at the Feature boundary so the shared save coordinator stays transport-free.
  const action = async (nickname: string): Promise<ExplicitSaveResult<string>> => {
    try {
      await onSave(nickname)
      return { status: "confirmed", value: nickname }
    } catch (error) {
      const kind = classifySettingsSaveFailure(error)
      switch (kind) {
        case "validation":
          return { status: "validation", violations: getSettingsInputViolations(error) }
        case "blocked":
          return {
            status: "blocked",
            feedback: getProfileBlockedFeedback(error, blockedMessage),
          }
        case "retryable":
          return { status: "retryable" }
        case "unknown":
          return { status: "unknown" }
      }
    }
  }

  const saveAction = useExplicitSave({
    draft: normalized,
    changed: dirty,
    invalid,
    readDraft: () => getValues("nickname").trim(),
    action,
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
    if (saveAction.isUnknown) return
    if (awaitingSourceEcho.current !== null) {
      if (initialNickname !== awaitingSourceEcho.current) return
      awaitingSourceEcho.current = null
    }
    const draftIsEdited = getValues("nickname").trim() !== saved.current
    saved.current = initialNickname
    if (
      !draftIsEdited &&
      !saveAction.isSaving &&
      saveAction.status !== "retryable"
    ) {
      reset({ nickname: initialNickname })
    }
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
      : saveAction.inspection

  return {
    field,
    fieldState,
    validation,
    normalized,
    dirty,
    invalid,
    showClientError: fieldState.isTouched || isSubmitted,
    isSaving: saveAction.isSaving,
    isBlocked: saveAction.isBlocked,
    isUnknown: saveAction.isUnknown,
    canRetryInspected: saveAction.canResaveInspected,
    saveLabel,
    saveState: saveAction.status === "retryable" ? "retryable-error" : saveAction.status,
    formInvalid,
    blockedFeedback: saveAction.blockedFeedback,
    inspection,
    save: submit,
    inspectCurrentProfile: async () => { await saveAction.inspectCurrent?.() },
    confirmObservedProfile: saveAction.confirmObservation,
    discardUnconfirmedDraft: saveAction.discardUnconfirmed,
    onDraftChange,
  }
}
