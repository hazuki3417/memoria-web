export const FIELD_VALID = ["idle", "accept", "warning", "reject"] as const
export type FieldValid = (typeof FIELD_VALID)[number]
