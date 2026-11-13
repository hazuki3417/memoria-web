"use client"

import { useEffect, useRef } from "react"
import { useController, useForm, type FieldPathValue } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import type { z } from "zod"
import { preferencesSchema } from "./preferencesSchema"
import { usePreferencesSave } from "./usePreferencesSave"
import { usePersonalAccentPreview } from "./PersonalAccentPreviewContext"
import type { UserPreferences, UserPreferencesPatch } from "./userPreferences"
import type { SavePersonalPreferencesAction } from "./preferencesSaveOutcome"

type SavePreferences = (patch: UserPreferencesPatch) => Promise<UserPreferences>
type PreferencesFormValues = z.input<typeof preferencesSchema>

/**
 * RHF owns editable Preference fields and the incomplete ColorInput draft.
 * 画面内AutoSaveQueueが送信順序を保持し、明示RetryをFeatureが判断する。
 */
export function useUserPreferences(
  initialPreferences: UserPreferences,
  onSave?: SavePreferences,
  onInspect?: () => Promise<UserPreferences>,
  onSaveAction?: SavePersonalPreferencesAction,
) {
  const {
    saveError,
    blockedFeedback,
    saveStatus,
    validation,
    confirmed,
    draftPatch,
    discardRevision,
    inspected,
    observedMatches,
    enqueue,
    setAccentDraft,
    retry,
    inspect,
    confirmObservation,
    discard,
  } = usePreferencesSave(onSave, initialPreferences, onInspect, onSaveAction)
  const preview = usePersonalAccentPreview()
  const initial = confirmed ?? initialPreferences
  const {
    control,
    watch,
    setValue,
    getValues,
    reset,
    setError,
    clearErrors,
    formState: { dirtyFields, errors },
  } = useForm<PreferencesFormValues>({
    resolver: zodResolver(preferencesSchema),
    mode: "onChange",
    defaultValues: {
      ...initial,
      accentDraft: initial.personalAccentColor,
    },
  })
  const { field: accentField, fieldState: accentState } = useController({
    control,
    name: "accentDraft",
  })
  // 表示中のServer Field ValidationをFieldへ適用する。
  useEffect(() => {
    if (!validation) return
    for (const [field, message] of Object.entries(validation.fieldErrors)) {
      setError(field as keyof PreferencesFormValues, {
        type: "server",
        message,
      })
    }
  }, [validation, setError])

  // Queryや保存確定値が変わっても編集中のFieldはRHFが保持する。
  const previousSource = useRef(initial)
  useEffect(() => {
    const previous = previousSource.current
    if ((Object.keys(previous) as Array<keyof UserPreferences>).every(
      (key) => previous[key] === initial[key],
    )) return
    previousSource.current = initial
    const noPersistence = !onSave && !onSaveAction
    const incompleteAccent = !preferencesSchema.shape.personalAccentColor.safeParse(
      getValues("accentDraft"),
    ).success
    reset({
      ...initial,
      ...draftPatch,
      accentDraft: incompleteAccent
        ? getValues("accentDraft")
        : draftPatch.personalAccentColor ?? initial.personalAccentColor,
    }, {
      // Pendingの後続編集と未完成ColorInputだけを保持する。
      keepDirtyValues: noPersistence
        ? Object.keys(dirtyFields).length > 0
        : Object.keys(draftPatch).length > 0 || incompleteAccent,
    })
  }, [initial, reset, dirtyFields, draftPatch, getValues, onSave, onSaveAction])

  const previousDiscardRevision = useRef(discardRevision)
  useEffect(() => {
    if (previousDiscardRevision.current === discardRevision) return
    previousDiscardRevision.current = discardRevision
    reset({ ...confirmed, accentDraft: confirmed.personalAccentColor })
    preview?.setColor(null)
  }, [discardRevision, confirmed, reset, preview])

  useEffect(() => () => { preview?.setColor(null) }, [preview?.setColor])

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
    clearErrors(key)
    setValue(key, value as FieldPathValue<PreferencesFormValues, K>, {
      shouldDirty: true,
    })
    enqueue({ [key]: value } as UserPreferencesPatch)
  }

  const changeAccentDraft = (value: string) => {
    clearErrors("personalAccentColor")
    setAccentDraft(value)
    setValue("accentDraft", value, { shouldDirty: true })
    const parsed = preferencesSchema.shape.personalAccentColor.safeParse(value)
    if (parsed.success) {
      const normalized = parsed.data.toUpperCase()
      change("personalAccentColor", normalized)
      if (saveError !== "blocked") preview?.setColor(normalized)
    }
  }

  return {
    preferences,
    accentDraft: values.accentDraft,
    accentOnBlur: accentField.onBlur,
    accentDraftError:
      accentState.isTouched &&
      !preferencesSchema.shape.personalAccentColor.safeParse(values.accentDraft).success
        ? "HEXカラーコード（#RRGGBB）を入力してください。"
        : undefined,
    change,
    changeAccentDraft,
    saveError,
    blockedFeedback,
    saveStatus,
    fieldErrors: errors,
    validation,
    retry,
    inspect,
    confirmObservation,
    discard,
    inspected,
    observedMatches,
    hasSession: true,
    canRetry: !values.accentDraft || /^#[0-9a-fA-F]{6}$/.test(values.accentDraft),
  }
}
