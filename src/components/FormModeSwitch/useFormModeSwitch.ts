"use client"
import "client-only"
import { useCallback, useState } from "react"
import { FormMode } from "./FormModeSwitchContext"

export type UseFormModeSwitchOption = FormMode

export type UseFormModeSwitchValue = {
  mode: FormMode
}

export interface UseFormModeSwitchControl {
  view: () => void
  new: () => void
  edit: () => void
  switch: (mode: FormMode) => void
}

export interface UseFormModeSwitchAction {}

export type UseFormModeSwitch = {
  value: UseFormModeSwitchValue
  control: UseFormModeSwitchControl
  // action: UseFormModeSwitchAction
}

export const useUseFormModeSwitch = (
  option: UseFormModeSwitchOption,
): UseFormModeSwitch => {
  const [mode, setMode] = useState<FormMode>(option)

  const viewhandle = useCallback(() => setMode("view"), [setMode])
  const newhandle = useCallback(() => setMode("new"), [setMode])
  const edithandle = useCallback(() => setMode("edit"), [setMode])

  return {
    value: { mode },
    control: {
      view: viewhandle,
      new: newhandle,
      edit: edithandle,
      switch: setMode,
    },
  }
}
