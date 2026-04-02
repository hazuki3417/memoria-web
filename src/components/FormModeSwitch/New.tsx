import React from "react"
import { useFormModeSwitch } from "./useFormModeSwitch"

export interface NewProps {
  children?: React.ReactNode
}

export const New = (props: NewProps) => {
  const { children } = props
  const { value } = useFormModeSwitch()
  return value.mode === "new" ? <>{children}</> : null
}
