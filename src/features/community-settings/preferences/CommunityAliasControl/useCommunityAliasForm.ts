"use client"

import { useEffect, useRef, useState, type ChangeEvent } from "react"
import { useController, useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import type { z } from "zod"
import { resolveFormFailureValidation } from "@/ui/formValidation"
import { useExplicitSave, resolveConfirmedSourceSync } from "@/ui/ExplicitSave"
import type { SaveActionResult } from "@/ui/SaveAction"
import { communityAliasSchema } from "./communityAliasSchema"
import { showNotification } from "@/components/Feedback"

/** Community AliasのRHF Draft、確認済みBaselineと取得値同期を所有する。 */
export function useCommunityAliasForm({
  savedAlias,
  onSave,
  onInspect,
}: {
  savedAlias: string | null
  onSave: (alias: string | null) => Promise<SaveActionResult<string | null>>
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

  const saveAction = useExplicitSave({
    draft,
    changed,
    invalid,
    readDraft: () => getValues("alias").trim() || null,
    action: onSave,
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
    const decision = resolveConfirmedSourceSync({
      source,
      expectedEcho: awaitingSourceEcho.current,
      baseline: savedBaseline.current,
      draft: getValues("alias").trim(),
      isUnknown: saveAction.isUnknown,
      canResetDraft: !saveAction.isSaving,
    })
    if (!decision.adopt) return
    awaitingSourceEcho.current = null
    savedBaseline.current = source
    if (decision.resetDraft) reset({ alias: source })
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

  return {
    field, fieldState, text,
    isSaving: saveAction.isSaving,
    isInputDisabled: saveAction.isInputDisabled,
    failure: saveAction.failure, formInvalid,
    blockedFeedback: saveAction.blockedFeedback,
    inspection: saveAction.inspection,
    inspect: async () => { await saveAction.inspectCurrent?.() },
    canResaveInspected: saveAction.canResaveInspected,
    confirmObservation: saveAction.confirmObservation,
    discardUnconfirmed: saveAction.discardUnconfirmed,
    normalized, validation,
    showClientError: fieldState.isTouched || isSubmitted,
    changed, invalid,
    canSubmit: saveAction.canSubmit,
    save: submit, onAliasChange,
  }
}
