import { Checkbox } from "@mantine/core"

export interface SelectableCheckboxProps {
  onChange?: React.ChangeEventHandler<HTMLInputElement, HTMLInputElement>
}

export const SelectableCheckbox = (props: SelectableCheckboxProps) => {
  const { ...rest } = props
  return (
    <Checkbox
      size="18px"
      styles={(theme) => ({
        root: {
          position: "absolute",
          top: 8,
          left: 8,
          // backgroundColor: theme.colors.gray[7],
          // opacity: 0.2,
          // transition: "opacity 0.2s",
          // "&:hover": {
          //   opacity: 1,
          // },
        },
      })}
      {...rest}
      data-testid="preview-image-box-selectable-checkbox"
    />
  )
}
SelectableCheckbox.displayName = "PreviewImageBox.SelectableCheckbox"
