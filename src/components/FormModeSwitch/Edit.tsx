import React from "react"
import { useFormModeSwitchContext } from "./useFormModeSwitchContext"

export interface EditProps {
  children?: React.ReactNode
}

export const Edit = (props: EditProps) => {
  const { children } = props
  const { value } = useFormModeSwitchContext()
  return value.mode === "edit" ? <>{children}</> : null
}
