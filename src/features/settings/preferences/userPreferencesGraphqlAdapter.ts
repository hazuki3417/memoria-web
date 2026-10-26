import {
  DateFormat,
  FileSizeUnit,
  MediaThumbnailSize,
  type UpdateUserPreferencesInput,
} from "@/infrastructure/graphql/generated"
import type { UserPreferences, UserPreferencesPatch } from "./userPreferences"

// GraphQLとの接続境界でのみGenerated Typeを使用する。
type PreferencesProjection = {
  personalAccentColor: string
  dateFormat: DateFormat
  fileSizeUnit: FileSizeUnit
  mediaThumbnailSize: MediaThumbnailSize
  mediaDetailNavigationWrap: boolean
  mediaDetailInitialInfoWide: boolean
  mediaDetailInitialInfoMedium: boolean
}

const dateFormats = {
  YYYY_MM_DD: DateFormat.YyyyMmDd,
  MM_DD_YYYY: DateFormat.MmDdYyyy,
  DD_MM_YYYY: DateFormat.DdMmYyyy,
} as const

const fileSizeUnits = {
  DECIMAL: FileSizeUnit.Decimal,
  BINARY: FileSizeUnit.Binary,
} as const

const thumbnailSizes = {
  SMALL: MediaThumbnailSize.Small,
  MEDIUM: MediaThumbnailSize.Medium,
  LARGE: MediaThumbnailSize.Large,
} as const

const dateFormatsFromGraphql: Record<DateFormat, UserPreferences["dateFormat"]> = {
  [DateFormat.YyyyMmDd]: "YYYY_MM_DD",
  [DateFormat.MmDdYyyy]: "MM_DD_YYYY",
  [DateFormat.DdMmYyyy]: "DD_MM_YYYY",
}

const fileSizeUnitsFromGraphql: Record<FileSizeUnit, UserPreferences["fileSizeUnit"]> = {
  [FileSizeUnit.Decimal]: "DECIMAL",
  [FileSizeUnit.Binary]: "BINARY",
}

const thumbnailSizesFromGraphql: Record<MediaThumbnailSize, UserPreferences["mediaThumbnailSize"]> = {
  [MediaThumbnailSize.Small]: "SMALL",
  [MediaThumbnailSize.Medium]: "MEDIUM",
  [MediaThumbnailSize.Large]: "LARGE",
}

export function fromGraphqlUserPreferences(
  preferences: PreferencesProjection,
): UserPreferences {
  return {
    personalAccentColor: preferences.personalAccentColor,
    dateFormat: dateFormatsFromGraphql[preferences.dateFormat],
    fileSizeUnit: fileSizeUnitsFromGraphql[preferences.fileSizeUnit],
    mediaThumbnailSize: thumbnailSizesFromGraphql[preferences.mediaThumbnailSize],
    mediaDetailNavigationWrap: preferences.mediaDetailNavigationWrap,
    mediaDetailInitialInfoWide: preferences.mediaDetailInitialInfoWide,
    mediaDetailInitialInfoMedium: preferences.mediaDetailInitialInfoMedium,
  }
}

export function toGraphqlUserPreferencesPatch(
  patch: UserPreferencesPatch,
): UpdateUserPreferencesInput {
  return {
    ...patch,
    dateFormat: patch.dateFormat ? dateFormats[patch.dateFormat] : undefined,
    fileSizeUnit: patch.fileSizeUnit ? fileSizeUnits[patch.fileSizeUnit] : undefined,
    mediaThumbnailSize: patch.mediaThumbnailSize
      ? thumbnailSizes[patch.mediaThumbnailSize]
      : undefined,
  }
}
