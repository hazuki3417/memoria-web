"use client"

import { useEffect, useRef, type Dispatch, type SetStateAction } from "react"
import { useController, useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import type { z } from "zod"
import { communityPreferencesSchema } from "./communityPreferencesSchema"
import type { SaveStatusState } from "@/components/SaveStatus"
import type { CommunityPreferencesSaveOperations } from "./communityPreferencesSaveOutcome"
import { useCommunityPreferencesAutoSave, type CommunityPreferencesAccentPreview } from "./useCommunityPreferencesAutoSave"

/** Preferencesの入力Draft・取得値との同期・Validationを管理する。 */
export const useCommunityPreferencesForm = ({
  accent: sourceAccent,
  initialDraft: sourceDraft,
  restoreOnAccentChange,
  preserveDraftOnAccentChange: preserveDraft,
  saveStatus: suppliedSaveStatus,
  onAccentDraftChange,
  onDraftValidityChange,
  setAccent,
  operations,
  preview,
}: {
  accent: string
  initialDraft?: string
  restoreOnAccentChange: boolean
  preserveDraftOnAccentChange: boolean
  saveStatus?: SaveStatusState
  onAccentDraftChange?: (value: string) => void
  onDraftValidityChange?: (valid: boolean) => void
  setAccent?: Dispatch<SetStateAction<string>>
  operations?: CommunityPreferencesSaveOperations
  preview?: CommunityPreferencesAccentPreview
}) => {
  const autoSave = useCommunityPreferencesAutoSave(sourceAccent, operations, preview)
  const { snapshot } = autoSave
  const accent = operations ? snapshot.confirmed?.accentColor ?? sourceAccent : sourceAccent
  const initialDraft = operations ? snapshot.draft?.accentColor ?? accent : sourceDraft
  const preserveDraftOnAccentChange = operations ? snapshot.failure !== null : preserveDraft
  const saveStatus = operations ? (snapshot.failure ? "attention" : snapshot.status) : suppliedSaveStatus
  const { control, getValues, reset } = useForm<
    z.input<typeof communityPreferencesSchema>
  >({
    resolver: zodResolver(communityPreferencesSchema),
    mode: "onChange",
    defaultValues: { accentDraft: initialDraft ?? accent },
  })
  const { field, fieldState } = useController({ control, name: "accentDraft" })

  // 未編集なら取得値に追従し、入力途中のDraftは明示破棄まで保持する。
  const previousAccent = useRef(accent)
  const previousInitialDraft = useRef(initialDraft)
  useEffect(() => {
    const draft = getValues("accentDraft")
    const draftIsEdited =
      draft.toUpperCase() !== previousAccent.current.toUpperCase()
    previousAccent.current = accent
    if (
      !preserveDraftOnAccentChange &&
      (restoreOnAccentChange || !draftIsEdited)
    ) {
      reset({ accentDraft: accent })
    }
  }, [
    accent,
    restoreOnAccentChange,
    preserveDraftOnAccentChange,
    getValues,
    reset,
  ])

  // 明示破棄でAliasを再Mountせず入力を復元する。
  // 通常の再取得やPendingは入力中のRHF Draftを上書きしない。
  useEffect(() => {
    if (
      initialDraft === undefined ||
      previousInitialDraft.current === initialDraft
    )
      return
    previousInitialDraft.current = initialDraft
    if (
      saveStatus === "idle" &&
      initialDraft.toUpperCase() === accent.toUpperCase()
    ) {
      reset({ accentDraft: initialDraft })
    }
  }, [initialDraft, saveStatus, accent, reset])

  const onDraftChange = (next: string) => {
    field.onChange(next)
    autoSave.edit({ accentColor: next })
    onAccentDraftChange?.(next)
    const parsed = communityPreferencesSchema.safeParse({ accentDraft: next })
    onDraftValidityChange?.(parsed.success)
    if (parsed.success) setAccent?.(parsed.data.accentDraft)
  }

  // 各Sectionが入力状態・Validation・変更操作を利用できるようにする。
  return {
    ...autoSave,
    saveStatus,
    field,
    fieldState,
    draftInvalid: !communityPreferencesSchema.safeParse({ accentDraft: field.value }).success,
    onDraftChange,
  }
}
