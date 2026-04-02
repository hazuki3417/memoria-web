import React from "react"
import { useFormModeSwitch } from "./useFormModeSwitch"

export interface ViewProps {
  children?: React.ReactNode
}

export const View = (props: ViewProps) => {
  const { children } = props
  const { value } = useFormModeSwitch()
  return value.mode === "view" ? <>{children}</> : null
}
