export const SUPPORTED_LOCALES = ["ja", "en"] as const
export type Locale = (typeof SUPPORTED_LOCALES)[number]
export const DEFAULT_LOCALE: Locale = "ja"
