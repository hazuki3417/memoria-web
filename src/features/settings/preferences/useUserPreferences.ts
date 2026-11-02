"use client"

import { useEffect, useRef } from "react"
import { useForm, type FieldPathValue } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import type { z } from "zod"
import { preferencesSchema } from "./preferencesSchema"
import { usePreferencesSave } from "./usePreferencesSave"
import type { UserPreferences, UserPreferencesPatch } from "./userPreferences"

type SavePreferences = (patch: UserPreferencesPatch) => Promise<UserPreferences>
type PreferencesFormValues = z.input<typeof preferencesSchema>

/**
 * RHF owns editable Preference fields and the incomplete ColorInput draft.
 * The existing queue remains the only owner of save ordering and retries.
 */
export function useUserPreferences(
  initialPreferences: UserPreferences,
  onSave?: SavePreferences,
  onInspect?: () => Promise<UserPreferences>,
) {
  const {
    saveError,
    saveStatus,
    sessionSnapshot,
    enqueue,
    setAccentDraft,
    retry,
    inspect,
    confirmObservation,
    discard,
  } = usePreferencesSave(onSave, initialPreferences, onInspect)
  const initial = {
    ...(sessionSnapshot?.confirmed ?? initialPreferences),
    ...(sessionSnapshot?.draftPatch ?? {}),
  }
  const {
    watch,
    setValue,
    getValues,
    reset,
    formState: { dirtyFields },
  } = useForm<PreferencesFormValues>({
    resolver: zodResolver(preferencesSchema),
    mode: "onChange",
    defaultValues: {
      ...initial,
      accentDraft: sessionSnapshot?.accentDraft ?? initial.personalAccentColor,
    },
  })
  // Apply new source values only to fields the user has not edited.
  // Dirty field subscriptions are required by RHF's keepDirtyValues option.
  const previousSource = useRef(initialPreferences)
  useEffect(() => {
    const previous = previousSource.current
    if (
      (Object.keys(previous) as Array<keyof UserPreferences>).every(
        (key) => previous[key] === initialPreferences[key],
      )
    )
      return
    previousSource.current = initialPreferences
    reset(
      {
        ...initialPreferences,
        ...(sessionSnapshot?.draftPatch ?? {}),
        accentDraft:
          sessionSnapshot?.accentDraft ??
          initialPreferences.personalAccentColor,
      },
      { keepDirtyValues: Object.keys(dirtyFields).length > 0 },
    )
  }, [initialPreferences, reset, dirtyFields, sessionSnapshot])
  const previousDiscardRevision = useRef(sessionSnapshot?.discardRevision)
  useEffect(() => {
    if (
      !sessionSnapshot ||
      previousDiscardRevision.current === sessionSnapshot.discardRevision
    )
      return
    previousDiscardRevision.current = sessionSnapshot.discardRevision
    const baseline = sessionSnapshot.confirmed ?? initialPreferences
    reset({ ...baseline, accentDraft: baseline.personalAccentColor })
  }, [sessionSnapshot, initialPreferences, reset])

  const values = watch()
  const preferences: UserPreferences = {
    personalAccentColor: values.personalAccentColor,
    dateFormat: values.dateFormat,
    fileSizeUnit: values.fileSizeUnit,
    mediaThumbnailSize: values.mediaThumbnailSize,
    mediaDetailNavigationWrap: values.mediaDetailNavigationWrap,
    mediaDetailInitialInfoWide: values.mediaDetailInitialInfoWide,
    mediaDetailInitialInfoMedium: values.mediaDetailInitialInfoMedium,
  }

  const change = <K extends keyof UserPreferences>(
    key: K,
    value: UserPreferences[K],
  ) => {
    if (saveError === "blocked") return
    // Do not enqueue a value that violates the same schema as the RHF form.
    if (!preferencesSchema.safeParse({ ...getValues(), [key]: value }).success)
      return
    setValue(key, value as FieldPathValue<PreferencesFormValues, K>, {
      shouldDirty: true,
    })
    enqueue({ [key]: value } as UserPreferencesPatch)
  }

  const changeAccentDraft = (value: string) => {
    setAccentDraft(value)
    setValue("accentDraft", value, { shouldDirty: true })
    const parsed = preferencesSchema.shape.personalAccentColor.safeParse(value)
    if (parsed.success) change("personalAccentColor", parsed.data.toUpperCase())
  }

  return {
    preferences,
    accentDraft: values.accentDraft,
    change,
    changeAccentDraft,
    saveError,
    saveStatus,
    retry,
    inspect,
    confirmObservation,
    discard,
    inspected: sessionSnapshot?.inspected ?? false,
    observedMatches: sessionSnapshot?.observedMatches ?? false,
    hasSession: Boolean(sessionSnapshot),
    canRetry:
      !sessionSnapshot?.accentDraft ||
      /^#[0-9a-fA-F]{6}$/.test(sessionSnapshot.accentDraft),
  }
}
