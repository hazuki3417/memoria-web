import { ActionIcon } from "@mantine/core"
import { IconX } from "@tabler/icons-react"

export interface DeleteButtonProps {
  onClick?: React.MouseEventHandler<HTMLButtonElement>
}

export const DeleteButton = (props: DeleteButtonProps) => {
  const { ...rest } = props
  return (
    <ActionIcon
      styles={(theme) => ({
        root: {
          position: "absolute",
          top: 8,
          right: 8,
          backgroundColor: theme.colors.red[7],
          opacity: 0.8,
        },
      })}
      size={20}
      {...rest}
      data-testid="preview-image-box-delete-button"
    >
      <IconX />
    </ActionIcon>
  )
}
DeleteButton.displayName = "ThumbnailBox.DeleteButton"
