"use client"

import { useEffect, useRef, type Dispatch, type SetStateAction } from "react"
import { useController, useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import type { z } from "zod"
import { communityAccentSchema } from "./communityAccentSchema"
import type { SaveStatusState } from "@/components/SaveStatus"

/** Owns Community Accent form draft, source reconciliation and validation. */
export function useCommunityAccentForm({
  accent,
  initialDraft,
  restoreOnAccentChange,
  preserveDraftOnAccentChange,
  saveStatus,
  onAccentDraftChange,
  onDraftValidityChange,
  setAccent,
}: {
  accent: string
  initialDraft?: string
  restoreOnAccentChange: boolean
  preserveDraftOnAccentChange: boolean
  saveStatus?: SaveStatusState
  onAccentDraftChange?: (value: string) => void
  onDraftValidityChange?: (valid: boolean) => void
  setAccent: Dispatch<SetStateAction<string>>
}) {
  const { control, getValues, reset } = useForm<
    z.input<typeof communityAccentSchema>
  >({
    resolver: zodResolver(communityAccentSchema),
    mode: "onChange",
    defaultValues: { accentDraft: initialDraft ?? accent },
  })
  const { field, fieldState } = useController({ control, name: "accentDraft" })

  // Refresh an untouched input; preserve an incomplete draft unless the
  // owning save controller explicitly restores its last confirmed value.
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

  // Explicit controller discard restores the input without remounting Alias controls.
  // Normal server refetch and pending input must not overwrite the live RHF Draft.
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
    onAccentDraftChange?.(next)
    const parsed = communityAccentSchema.safeParse({ accentDraft: next })
    onDraftValidityChange?.(parsed.success)
    if (parsed.success) setAccent(parsed.data.accentDraft)
  }

  return {
    field,
    fieldState,
    draftInvalid: !communityAccentSchema.safeParse({ accentDraft: field.value }).success,
    onDraftChange,
  }
}
