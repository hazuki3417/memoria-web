import { ActionIcon } from "@mantine/core"
import { IconX } from "@tabler/icons-react"

export interface RemoveButtonProps {
  onClick?: React.MouseEventHandler<HTMLButtonElement>
}

export const RemoveButton = (props: RemoveButtonProps) => {
  const { ...rest } = props
  return (
    <ActionIcon
      styles={(theme) => ({
        root: {
          position: "absolute",
          top: 8,
          right: 8,
          backgroundColor: theme.colors.gray[7],
          opacity: 0.2,
          transition: "opacity 0.2s",
          "&:hover": {
            opacity: 1,
          },
        },
      })}
      size={20}
      {...rest}
      data-testid="preview-image-box-remove-button"
    >
      <IconX />
    </ActionIcon>
  )
}
RemoveButton.displayName = "ThumbnailImage.RemoveButton"
