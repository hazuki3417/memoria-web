/**
 * Account-synchronized user preferences.
 * Theme is browser/device-local and deliberately excluded.
 * Values match the GraphQL contract in memoria-design.
 */
export type UserPreferences = {
  personalAccentColor: string
  dateFormat: "YYYY/MM/DD" | "MM/DD/YYYY" | "DD/MM/YYYY"
  fileSizeUnit: "DECIMAL" | "BINARY"
  mediaThumbnailSize: "SMALL" | "MEDIUM" | "LARGE"
  mediaDetailNavigationWrap: boolean
  mediaDetailInitialInfoWide: boolean
  mediaDetailInitialInfoMedium: boolean
}

export type UserPreferencesPatch = Partial<UserPreferences>

export const defaultUserPreferences: Readonly<UserPreferences> = {
  personalAccentColor: "#10B981",
  dateFormat: "YYYY/MM/DD",
  fileSizeUnit: "DECIMAL",
  mediaThumbnailSize: "MEDIUM",
  mediaDetailNavigationWrap: false,
  mediaDetailInitialInfoWide: true,
  mediaDetailInitialInfoMedium: false,
}
