import { Checkbox, CheckboxProps } from "@mantine/core"
import React from "react"

export interface SelectableCheckboxProps extends CheckboxProps {}

export const SelectableCheckbox = React.forwardRef<
  HTMLInputElement,
  SelectableCheckboxProps
>((props, ref) => {
  const { ...rest } = props
  return (
    <Checkbox
      ref={ref}
      size="xs"
      color="blue"
      styles={(theme) => ({
        root: {
          position: "absolute",
          top: 8,
          left: 8,
        },
      })}
      {...rest}
      data-testid="preview-image-box-selectable-checkbox"
    />
  )
})
SelectableCheckbox.displayName = "ThumbnailBox.SelectableCheckbox"
