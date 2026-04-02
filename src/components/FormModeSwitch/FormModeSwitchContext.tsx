"use client"
import { defineFieldObject } from "@/lib/field"
import { createContext } from "react"

const FORM_MODE = ["new", "edit", "view"] as const
export type FormMode = (typeof FORM_MODE)[number]
export const FORM_MODE_FIELDS = defineFieldObject(FORM_MODE)

export type FormModeSwitchValue = {
  mode: FormMode
}

export interface FormModeSwitchControl {}

export interface FormModeSwitchAction {
  switch: (mode: FormMode) => void
}

export type FormModeSwitchContext = {
  value: FormModeSwitchValue
  // control: FormModeSwitchControl
  action: FormModeSwitchAction
}

export const FormModeSwitchContext = createContext<
  FormModeSwitchContext | undefined
>(undefined)
