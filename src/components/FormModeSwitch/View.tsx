import React from "react"
import { useFormModeSwitchContext } from "./useFormModeSwitchContext"

export interface ViewProps {
  children?: React.ReactNode
}

export const View = (props: ViewProps) => {
  const { children } = props
  const { value } = useFormModeSwitchContext()
  return value.mode === "view" ? <>{children}</> : null
}
