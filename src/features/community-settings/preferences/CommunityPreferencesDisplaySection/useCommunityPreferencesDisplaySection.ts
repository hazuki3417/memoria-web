"use client"

import { useMediaQuery } from "@mantine/hooks"
import type { useCommunityPreferencesForm } from "../useCommunityPreferencesForm"

export type CommunityPreferencesDisplaySectionInput = Pick<
  ReturnType<typeof useCommunityPreferencesForm>,
  "field" | "fieldState" | "draftInvalid" | "onDraftChange"
>

/** 表示Sectionに必要な入力状態とResponsive条件を組み立てる。 */
export const useCommunityPreferencesDisplaySection = (
  model: CommunityPreferencesDisplaySectionInput,
  accentError?: string,
) => {
  const compact = useMediaQuery("(max-width: 48em)")
  const { field, fieldState, draftInvalid, onDraftChange } = model
  const error = accentError ??
    (fieldState.isTouched && draftInvalid
      ? "HEXカラーコード（#RRGGBB）を入力してください。"
      : undefined)

  return { compact, field, error, onDraftChange }
}

export type CommunityPreferencesDisplaySectionModel =
  ReturnType<typeof useCommunityPreferencesDisplaySection>
