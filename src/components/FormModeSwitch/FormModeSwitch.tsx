import React, { memo } from "react"
import { Edit } from "./Edit"
import { FormMode } from "./FormModeSwitchContext"
import { FormModeSwitchProvider } from "./FormModeSwitchProvider"
import { New } from "./New"
import { View } from "./View"

export interface FormModeProps {
  mode: FormMode
  children: React.ReactNode
}

export const FormModeSwitch = (props: FormModeProps) => {
  const { mode, children } = props

  return (
    <FormModeSwitchProvider
      value={{
        value: { mode },
      }}
    >
      {children}
    </FormModeSwitchProvider>
  )
}

FormModeSwitch.Edit = memo(Edit)
FormModeSwitch.View = memo(View)
FormModeSwitch.New = memo(New)
