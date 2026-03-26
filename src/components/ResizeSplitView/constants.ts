import { defineFieldObject } from "@/lib/field"

export const PANEL_ID_LIST = ["left", "right"] as const
export const PANEL_FIELDS = defineFieldObject(PANEL_ID_LIST)
