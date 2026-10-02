"use client"
import { createContext } from "react"
import { defineFieldObject } from "@/lib/field"

const FORM_MODE = ["new", "edit", "view"] as const
export type FormMode = (typeof FORM_MODE)[number]
export const FORM_MODE_FIELDS = defineFieldObject(FORM_MODE)

export type FormModeSwitchValue = {
  mode: FormMode
}

// export type FormModeSwitchControl = {}

// export type FormModeSwitchAction = {}

export type FormModeSwitchContext = {
  value: FormModeSwitchValue
  // control: FormModeSwitchControl
  // action: FormModeSwitchAction
}

export const FormModeSwitchContext = createContext<
  FormModeSwitchContext | undefined
>(undefined)
