import { Checkbox } from "@mantine/core"

export interface SelectableCheckboxProps {
  onChange?: React.ChangeEventHandler<HTMLInputElement, HTMLInputElement>
}

export const SelectableCheckbox = (props: SelectableCheckboxProps) => {
  const { ...rest } = props
  return (
    <Checkbox
      size="18px"
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
}
SelectableCheckbox.displayName = "PreviewImageBox.SelectableCheckbox"
