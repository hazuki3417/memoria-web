import { SegmentedControl } from "@mantine/core"
import { MODE, UseFormSwitcher } from "./useFormSwitcher"
import React from "react"
import {
  FormSwitcherProvider,
  useFormSwitcherContext,
} from "./FormSwitcherContext"

export type SegmentedControlUi = {
  disabled: {
    single: boolean
    all: boolean
  }
}

export interface SegmentedControlProps {
  ui: SegmentedControlUi
}

export interface FormSwitcherProps {
  value: UseFormSwitcher
  children: React.ReactNode
}

export const FormSwitcher = (props: FormSwitcherProps) => {
  const { value, children } = props
  return <FormSwitcherProvider value={value}>{children}</FormSwitcherProvider>
}

FormSwitcher.SegmentedControl = (props: SegmentedControlProps) => {
  const { ui } = props
  const { state, handler } = useFormSwitcherContext()

  return (
    <SegmentedControl
      size="xs"
      value={state.mode}
      onChange={handler.set}
      data={[
        { label: "一括", value: MODE.TYPE.ALL, disabled: ui.disabled.all },
        {
          label: "個別",
          value: MODE.TYPE.SINGLE,
          disabled: ui.disabled.single,
        },
      ]}
    />
  )
}

FormSwitcher.All = ({ children }: { children: React.ReactNode }) => {
  const { state } = useFormSwitcherContext()
  return state.mode === MODE.TYPE.ALL ? <>{children}</> : null
}

FormSwitcher.Single = ({ children }: { children: React.ReactNode }) => {
  const { state } = useFormSwitcherContext()
  return state.mode === MODE.TYPE.SINGLE ? <>{children}</> : null
}
