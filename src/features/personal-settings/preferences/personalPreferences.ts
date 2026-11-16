/**
 * Account-synchronized user preferences.
 * Theme is browser/device-local and deliberately excluded.
 * Values match the GraphQL contract in memoria-design.
 */
export type PersonalPreferencesValues = {
  personalAccentColor: string
  dateFormat: "YYYY_MM_DD" | "MM_DD_YYYY" | "DD_MM_YYYY"
  fileSizeUnit: "DECIMAL" | "BINARY"
  mediaThumbnailSize: "SMALL" | "MEDIUM" | "LARGE"
  mediaDetailNavigationWrap: boolean
  mediaDetailInitialInfoWide: boolean
  mediaDetailInitialInfoMedium: boolean
}

export type PersonalPreferencesPatch = Partial<PersonalPreferencesValues>

export const defaultPersonalPreferences: Readonly<PersonalPreferencesValues> = {
  personalAccentColor: "#10B981",
  dateFormat: "YYYY_MM_DD",
  fileSizeUnit: "DECIMAL",
  mediaThumbnailSize: "MEDIUM",
  mediaDetailNavigationWrap: false,
  mediaDetailInitialInfoWide: true,
  mediaDetailInitialInfoMedium: false,
}
