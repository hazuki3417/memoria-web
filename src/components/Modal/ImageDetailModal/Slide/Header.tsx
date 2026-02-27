import { ActionIcon, Box, type BoxProps } from "@mantine/core"
import { IconX } from "@tabler/icons-react"
import type React from "react"
import { styles } from "./styles"

export type HeaderHandler = {
  onClose?: React.MouseEventHandler<HTMLButtonElement>
}

export interface HeaderProps extends BoxProps {
  handler?: HeaderHandler
}

export const Header = (props: HeaderProps) => {
  const { handler } = props
  return (
    <Box
      style={(theme) => ({
        display: "flex",
        height: `${styles.NAVIGATION_HEIGHT}px`,
        width: "100%",
      })}
    >
      <Box
        style={(theme) => ({
          width: `${styles.SIDEBAR_WIDTH}px`,
        })}
      />
      <Box
        style={(theme) => ({
          width: `calc(100% - ${styles.SIDEBAR_WIDTH * 2}px)`,
        })}
      />
      <Box
        style={(theme) => ({
          alignItems: "center",
          display: "flex",
          justifyContent: "center",
          width: `${styles.SIDEBAR_WIDTH}px`,
        })}
      >
        <ActionIcon
          variant="subtle"
          color="gray"
          data-testid="close-slide"
          onClick={handler?.onClose}
        >
          <IconX />
        </ActionIcon>
      </Box>
    </Box>
  )
}
