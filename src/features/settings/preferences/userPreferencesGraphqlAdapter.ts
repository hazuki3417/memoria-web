import {
  DateFormat,
  FileSizeUnit,
  MediaThumbnailSize,
  type UpdateUserPreferencesInput,
} from "@/infrastructure/graphql/generated"
import type { UserPreferences, UserPreferencesPatch } from "./userPreferences"

// Only this GraphQL boundary depends on generated API types.
// Zod schemas normalize Form inputs into application values, not GraphQL inputs.
type PreferencesProjection = {
  personalAccentColor: string
  dateFormat: UserPreferences["dateFormat"]
  fileSizeUnit: UserPreferences["fileSizeUnit"]
  mediaThumbnailSize: UserPreferences["mediaThumbnailSize"]
  mediaDetailNavigationWrap: boolean
  mediaDetailInitialInfoWide: boolean
  mediaDetailInitialInfoMedium: boolean
}

const dateFormats = {
  YYYY_MM_DD: DateFormat.YyyyMmDd,
  MM_DD_YYYY: DateFormat.MmDdYyyy,
  DD_MM_YYYY: DateFormat.DdMmYyyy,
} as const satisfies Record<UserPreferences["dateFormat"], DateFormat>

const fileSizeUnits = {
  DECIMAL: FileSizeUnit.Decimal,
  BINARY: FileSizeUnit.Binary,
} as const satisfies Record<UserPreferences["fileSizeUnit"], FileSizeUnit>

const thumbnailSizes = {
  SMALL: MediaThumbnailSize.Small,
  MEDIUM: MediaThumbnailSize.Medium,
  LARGE: MediaThumbnailSize.Large,
} as const satisfies Record<UserPreferences["mediaThumbnailSize"], MediaThumbnailSize>

export function fromGraphqlUserPreferences(
  preferences: PreferencesProjection,
): UserPreferences {
  return {
    personalAccentColor: preferences.personalAccentColor,
    dateFormat: preferences.dateFormat,
    fileSizeUnit: preferences.fileSizeUnit,
    mediaThumbnailSize: preferences.mediaThumbnailSize,
    mediaDetailNavigationWrap: preferences.mediaDetailNavigationWrap,
    mediaDetailInitialInfoWide: preferences.mediaDetailInitialInfoWide,
    mediaDetailInitialInfoMedium: preferences.mediaDetailInitialInfoMedium,
  }
}

// This mapper serves event-generated application patches, not a single form's
// submission. Keep the incomplete ColorInput accentDraft out of its input I/F.
export function toGraphqlUserPreferencesPatch(
  patch: UserPreferencesPatch,
): UpdateUserPreferencesInput {
  return {
    ...patch,
    dateFormat: patch.dateFormat ? dateFormats[patch.dateFormat] : undefined,
    fileSizeUnit: patch.fileSizeUnit
      ? fileSizeUnits[patch.fileSizeUnit]
      : undefined,
    mediaThumbnailSize: patch.mediaThumbnailSize
      ? thumbnailSizes[patch.mediaThumbnailSize]
      : undefined,
  }
}
