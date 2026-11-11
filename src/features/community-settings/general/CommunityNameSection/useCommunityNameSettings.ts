"use client"

import { useEffect, useRef, useState, type SetStateAction } from "react"
import { useController, useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import type { z } from "zod"
import { resolveFormFailureValidation } from "@/ui/formValidation"
import { useExplicitSave, type ExplicitSaveResult } from "@/ui/ExplicitSave"
import { communityNameSchema } from "./communityNameSchema"
import { showNotification } from "@/components/Feedback"
import {
  classifySettingsSaveFailure,
  getSettingsInputViolations,
  type SettingsSaveFailureKind,
} from "@/infrastructure/graphql/settingsMutationResult"
import { getCommunityBlockedFeedback } from "../../communityBlockedFeedback"
import { resolveCommunityNameSaveFeedback, type CommunityNameInspection } from "./resolveCommunityNameSaveFeedback"

/** Community名のRHF Draft、確認済みBaselineと取得値同期を所有する。 */
export function useCommunityNameSettings({
  communityName,
  onSaveName,
  onInspectName,
}: {
  communityName?: string
  onSaveName?: (name: string) => Promise<string>
  onInspectName?: () => Promise<string>
}) {
  const initialName = communityName ?? "家族のアルバム"
  const {
    control, reset, getValues, handleSubmit, setError, clearErrors,
    formState: { isSubmitted },
  } = useForm<
    z.input<typeof communityNameSchema>,
    unknown,
    z.output<typeof communityNameSchema>
  >({
    resolver: zodResolver(communityNameSchema),
    mode: "onChange",
    defaultValues: { name: initialName },
  })
  const { field, fieldState } = useController({ control, name: "name" })
  const savedName = useRef(initialName)
  const previousSource = useRef(communityName)
  const awaitingSourceEcho = useRef<string | null>(null)
  const [formInvalid, setFormInvalid] = useState(false)

  const draft = field.value
  const normalized = draft.trim()
  const dirty = normalized !== savedName.current
  const invalid = !communityNameSchema.safeParse({ name: draft }).success

  const adoptCurrentName = (current: string) => {
    savedName.current = current
    awaitingSourceEcho.current = communityName === current ? null : current
    reset({ name: current })
    clearErrors("name")
    setFormInvalid(false)
  }

  const action = async (value: string): Promise<ExplicitSaveResult<string>> => {
    try {
      const confirmed = onSaveName ? await onSaveName(value) : value
      return { status: "confirmed", value: confirmed }
    } catch (error) {
      const kind = classifySettingsSaveFailure(error)
      switch (kind) {
        case "validation":
          return { status: "validation", violations: getSettingsInputViolations(error) }
        case "blocked":
          return {
            status: "blocked",
            feedback: getCommunityBlockedFeedback(error, "Community名"),
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
    readDraft: () => getValues("name").trim(),
    action,
    inspect: onInspectName,
    adopt: adoptCurrentName,
    onValidation: (violations) => {
      const result = resolveFormFailureValidation(violations, ["name"])
      if (result.fieldErrors.name) {
        setError("name", { type: "server", message: result.fieldErrors.name })
      }
      setFormInvalid(result.formError)
    },
    onConfirmed: () => {
      showNotification({
        kind: "success",
        title: "Community名を変更",
        description: "Community名を変更しました。",
      })
    },
  })

  // Protect edited/unknown drafts and confirmed writes from stale refetches.
  useEffect(() => {
    if (communityName === undefined || previousSource.current === communityName)
      return
    previousSource.current = communityName
    if (saveAction.isUnknown) return
    if (awaitingSourceEcho.current !== null) {
      if (communityName !== awaitingSourceEcho.current) return
      awaitingSourceEcho.current = null
    }
    const draftIsEdited = getValues("name").trim() !== savedName.current
    savedName.current = communityName
    if (!draftIsEdited && !saveAction.isSaving) reset({ name: communityName })
  }, [communityName, saveAction.isUnknown, saveAction.isSaving, getValues, reset])

  const setDraft = (next: SetStateAction<string>) => {
    field.onChange(typeof next === "function" ? next(field.value) : next)
    clearErrors("name")
    saveAction.onDraftChange()
    // Form-level server error persists until a confirmed new submit.
  }

  const submit = handleSubmit(async ({ name }) => {
    if (!saveAction.canSave) return
    setFormInvalid(false)
    clearErrors("name")
    await saveAction.save(name)
  })
  const saveName = () => { void submit() }

  const inspection: CommunityNameInspection =
    saveAction.inspection.status === "matches" ||
    saveAction.inspection.status === "differs"
      ? {
          status: saveAction.inspection.status,
          name: saveAction.inspection.value,
        }
      : saveAction.inspection
  const failure: SettingsSaveFailureKind | null =
    saveAction.status === "retryable" ||
    saveAction.status === "blocked" ||
    saveAction.status === "unknown"
      ? saveAction.status
      : null

  const saveFeedback = resolveCommunityNameSaveFeedback({
    formInvalid,
    failure,
    blockedFeedback: saveAction.blockedFeedback,
    inspection,
    draft,
    hasInspector: Boolean(onInspectName),
  })

  return {
    draft,
    setDraft,
    dirty,
    invalid,
    canSubmit: saveAction.canSubmit,
    savingName: saveAction.isSaving,
    isInputDisabled: saveAction.isInputDisabled,
    saveName,
    fieldError: fieldState.error?.type === "server"
      ? fieldState.error.message
      : (fieldState.isTouched || isSubmitted) && invalid
        ? "Community名を入力してください"
        : undefined,
    onNameBlur: field.onBlur,
    saveFeedback,
    saveBlocked: saveAction.isBlocked || saveAction.isUnknown,
    inspectName: saveAction.inspectCurrent,
    inspection,
    confirmObservation: saveAction.confirmObservation,
    discardUnconfirmed: saveAction.discardUnconfirmed,
    canResaveInspected: saveAction.canResaveInspected,
    unknown: saveAction.isUnknown,
  }
}
