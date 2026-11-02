"use client"

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
) {
  const { watch, setValue, getValues } = useForm<PreferencesFormValues>({
    resolver: zodResolver(preferencesSchema),
    mode: "onChange",
    defaultValues: {
      ...initialPreferences,
      accentDraft: initialPreferences.personalAccentColor,
    },
  })
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
  const { saveError, enqueue, retry } = usePreferencesSave(onSave)

  const change = <K extends keyof UserPreferences>(
    key: K,
    value: UserPreferences[K],
  ) => {
    if (saveError === "blocked") return
    // Do not enqueue a value that violates the same schema as the RHF form.
    if (!preferencesSchema.safeParse({ ...getValues(), [key]: value }).success) return
    setValue(key, value as FieldPathValue<PreferencesFormValues, K>, {
      shouldDirty: true,
    })
    enqueue({ [key]: value } as UserPreferencesPatch)
  }

  const changeAccentDraft = (value: string) => {
    setValue("accentDraft", value, { shouldDirty: true })
    if (/^#[0-9a-fA-F]{6}$/.test(value)) {
      change("personalAccentColor", value.toUpperCase())
    }
  }

  return {
    preferences,
    accentDraft: values.accentDraft,
    change,
    changeAccentDraft,
    saveError,
    retry,
  }
}
