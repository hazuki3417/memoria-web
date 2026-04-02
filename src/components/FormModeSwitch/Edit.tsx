import React from "react"
import { useFormModeSwitch } from "./useFormModeSwitch"

export interface EditProps {
  children?: React.ReactNode
}

export const Edit = (props: EditProps) => {
  const { children } = props
  const { value } = useFormModeSwitch()
  return value.mode === "edit" ? <>{children}</> : null
}
