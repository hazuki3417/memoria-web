import { ActionIcon } from "@mantine/core"
import { IconPlus } from "@tabler/icons-react"

export interface AddButtonProps {
  onClick?: React.MouseEventHandler<HTMLButtonElement>
}

export const AddButton = (props: AddButtonProps) => {
  const { ...rest } = props
  return (
    <ActionIcon
      styles={(theme) => ({
        root: {
          position: "absolute",
          top: 8,
          right: 8,
          backgroundColor: theme.colors.green[7],
          opacity: 0.8,
        },
      })}
      size={20}
      {...rest}
      data-testid="preview-image-box-add-button"
    >
      <IconPlus />
    </ActionIcon>
  )
}
AddButton.displayName = "ThumbnailBox.AddButton"
