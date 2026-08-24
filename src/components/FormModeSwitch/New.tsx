import React from "react"
import { useFormModeSwitchContext } from "./useFormModeSwitchContext"

export interface NewProps {
  children?: React.ReactNode
}

export const New = (props: NewProps) => {
  const { children } = props
  const { value } = useFormModeSwitchContext()
  return value.mode === "new" ? <>{children}</> : null
}
