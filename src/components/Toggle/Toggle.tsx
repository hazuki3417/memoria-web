import {
  InputWrapper,
  InputWrapperProps,
  Switch,
  SwitchProps,
} from "@mantine/core"
import { IconLetterISmall, IconLetterOSmall } from "@tabler/icons-react"
import { useState } from "react"

export interface ToggleProps
  extends Pick<InputWrapperProps, "label" | "description" | "error" | "size">,
    Omit<
      SwitchProps,
      | "mt"
      | "mb"
      | "color"
      | "radius"
      | "withThumbIndicator"
      | "onLabel"
      | "offLabel"
      | "label"
    > {}

export const Toggle = (props: ToggleProps) => {
  const {
    label,
    description,
    error,
    size,
    checked,
    defaultChecked,
    onChange,
    ...rest
  } = props
  const inputWrapperProps = { label, description, error, size }

  const isControlled = typeof checked === "boolean"
  const [internalChecked, setInternalChecked] = useState(
    defaultChecked ?? false,
  )

  const currentChecked = isControlled ? checked : internalChecked

  const handleChange = (
    event: React.ChangeEvent<HTMLInputElement, HTMLInputElement>,
  ) => {
    const next = event.currentTarget.checked

    if (!isControlled) {
      setInternalChecked(next)
    }
    onChange?.(event)
  }

  return (
    <InputWrapper {...inputWrapperProps}>
      <Switch
        mt={8}
        mb={4}
        color="blue"
        radius="sm"
        withThumbIndicator={false}
        onLabel={<IconLetterISmall size={24} />}
        offLabel={<IconLetterOSmall size={24} />}
        size={size}
        checked={currentChecked}
        label={currentChecked ? "on" : "off"}
        onChange={handleChange}
        {...rest}
      />
    </InputWrapper>
  )
}
