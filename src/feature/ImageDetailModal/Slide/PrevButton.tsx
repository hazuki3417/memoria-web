import { UnstyledButton, UnstyledButtonProps } from "@mantine/core"
import { IconChevronCompactLeft } from "@tabler/icons-react"
import React from "react"
import { styles } from "./styles"

type BaseProps = UnstyledButtonProps & React.ComponentProps<"button">

export interface PrevButtonProps extends BaseProps {}

export const PrevButton = (props: PrevButtonProps) => {
  const { ...rest } = props
  return (
    <UnstyledButton
      style={(theme) => ({
        alignItems: "center",
        display: "flex",
        justifyContent: "center",
        width: `${styles.SIDEBAR_WIDTH}px`,
      })}
      {...rest}
    >
      <IconChevronCompactLeft />
    </UnstyledButton>
  )
}
PrevButton.displayName = "ImageDetailModal.Slide.PrevButton"
