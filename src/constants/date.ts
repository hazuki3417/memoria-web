export const TIME_ZONES = [
  ...Intl.supportedValuesOf("timeZone"),
  "UTC",
] as const
export type TimeZone = (typeof TIME_ZONES)[number]
export const DEFAULT_TIME_ZONE: TimeZone = "Asia/Tokyo"
