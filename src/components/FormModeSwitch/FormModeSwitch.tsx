import React, { memo, useCallback, useState } from "react"
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

  const [formMode, setFormMode] = useState<FormMode>(mode)

  const handelSwitch = useCallback(
    (mode: FormMode) => {
      setFormMode(mode)
    },
    [setFormMode],
  )
  return (
    <FormModeSwitchProvider
      value={{
        value: { mode: formMode },
        action: { switch: handelSwitch },
      }}
    >
      {children}
    </FormModeSwitchProvider>
  )
}

FormModeSwitch.Edit = memo(Edit)
FormModeSwitch.View = memo(View)
FormModeSwitch.New = memo(New)
