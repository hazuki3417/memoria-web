"use client"

import { useEffect, useRef, useState, type ChangeEvent } from "react"
import { useController, useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import type { z } from "zod"
import { resolveFormFailureValidation } from "@/ui/formValidation"
import { useExplicitSave, type ExplicitSaveResult } from "@/ui/ExplicitSave"
import { communityAliasSchema } from "./communityAliasSchema"
import { showNotification } from "@/components/Feedback"
import { getCommunityBlockedFeedback } from "../../communityBlockedFeedback"
import {
  classifySettingsSaveFailure,
  getSettingsInputViolations,
  type SettingsSaveFailureKind,
} from "@/infrastructure/graphql/settingsMutationResult"

/** Community AliasのRHF Draft、確認済みBaselineと取得値同期を所有する。 */
export function useCommunityAliasForm({
  savedAlias,
  onSave,
  onInspect,
}: {
  savedAlias: string | null
  onSave: (alias: string | null) => Promise<void>
  onInspect?: () => Promise<string | null>
}) {
  const {
    control, getValues, reset, handleSubmit, setError, clearErrors,
    formState: { isSubmitted },
  } = useForm<
    z.input<typeof communityAliasSchema>,
    unknown,
    z.output<typeof communityAliasSchema>
  >({
    resolver: zodResolver(communityAliasSchema),
    mode: "onChange",
    defaultValues: { alias: savedAlias ?? "" },
  })
  const { field, fieldState } = useController({ control, name: "alias" })
  const [formInvalid, setFormInvalid] = useState(false)
  const previousSourceAlias = useRef(savedAlias ?? "")
  const savedBaseline = useRef(savedAlias ?? "")
  const awaitingSourceEcho = useRef<string | null>(null)

  const text = field.value
  const normalized = text.trim()
  const draft = normalized || null
  const validation = communityAliasSchema.safeParse({ alias: text })
  const changed = normalized !== savedBaseline.current
  const invalid = !validation.success

  const adoptCurrentAlias = (alias: string | null) => {
    const value = alias ?? ""
    savedBaseline.current = value
    awaitingSourceEcho.current = value === (savedAlias ?? "") ? null : value
    reset({ alias: value })
    setFormInvalid(false)
    clearErrors("alias")
  }

  const action = async (alias: string | null): Promise<ExplicitSaveResult<string | null>> => {
    try {
      await onSave(alias)
      return { status: "confirmed", value: alias }
    } catch (error) {
      const kind = classifySettingsSaveFailure(error)
      switch (kind) {
        case "validation":
          return { status: "validation", violations: getSettingsInputViolations(error) }
        case "blocked":
          return {
            status: "blocked",
            feedback: getCommunityBlockedFeedback(error, "Community別名"),
          }
        case "retryable":
          return { status: "retryable" }
        case "unknown":
          return { status: "unknown" }
      }
    }
  }

  const saveAction = useExplicitSave({
    draft,
    changed,
    invalid,
    readDraft: () => getValues("alias").trim() || null,
    action,
    inspect: onInspect,
    adopt: adoptCurrentAlias,
    onValidation: (violations) => {
      const result = resolveFormFailureValidation(violations, ["alias"])
      if (result.fieldErrors.alias) {
        setError("alias", { type: "server", message: result.fieldErrors.alias })
      }
      setFormInvalid(result.formError)
    },
    onConfirmed: (alias) => {
      showNotification({
        kind: "success",
        title: "Community別名を保存",
        description: alias ? "別名を変更しました。" : "別名を解除しました。",
      })
    },
  })

  // A stale source Query must not overwrite confirmed values or edited Drafts.
  useEffect(() => {
    const source = savedAlias ?? ""
    if (previousSourceAlias.current === source) return
    previousSourceAlias.current = source
    if (saveAction.isUnknown) return
    if (awaitingSourceEcho.current !== null) {
      if (source !== awaitingSourceEcho.current) return
      awaitingSourceEcho.current = null
    }
    const draftIsEdited = getValues("alias").trim() !== savedBaseline.current
    savedBaseline.current = source
    if (!draftIsEdited && !saveAction.isSaving) reset({ alias: source })
  }, [savedAlias, saveAction.isUnknown, saveAction.isSaving, getValues, reset])

  const submit = handleSubmit(async ({ alias }) => {
    if (!saveAction.canSave) return
    setFormInvalid(false)
    clearErrors("alias")
    await saveAction.save(alias)
  })

  const onAliasChange = (event: ChangeEvent<HTMLInputElement>) => {
    field.onChange(event.currentTarget.value)
    clearErrors("alias")
    saveAction.onDraftChange()
    // Form-level server errors remain visible until another submit.
  }

  const inspection =
    saveAction.inspection.status === "matches" ||
    saveAction.inspection.status === "differs"
      ? {
          status: saveAction.inspection.status,
          alias: saveAction.inspection.value,
        }
      : saveAction.inspection

  const failure: SettingsSaveFailureKind | null =
    saveAction.status === "retryable" ||
    saveAction.status === "blocked" ||
    saveAction.status === "unknown"
      ? saveAction.status
      : null

  return {
    field, fieldState, text,
    saving: saveAction.isSaving,
    isInputDisabled: saveAction.isInputDisabled,
    failure, formInvalid,
    blockedFeedback: saveAction.blockedFeedback,
    inspection,
    inspect: saveAction.inspectCurrent,
    canResaveInspected: saveAction.canResaveInspected,
    confirmObservation: saveAction.confirmObservation,
    discardUnconfirmed: saveAction.discardUnconfirmed,
    normalized, validation,
    showClientError: fieldState.isTouched || isSubmitted,
    changed, invalid,
    save: submit, onAliasChange,
  }
}
