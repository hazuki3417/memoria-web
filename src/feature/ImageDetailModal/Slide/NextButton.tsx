import { UnstyledButton, UnstyledButtonProps } from "@mantine/core"
import { IconChevronCompactRight } from "@tabler/icons-react"
import React from "react"
import { styles } from "./styles"

type BaseProps = UnstyledButtonProps & React.ComponentProps<"button">

export interface NextButtonProps extends BaseProps {}

export const NextButton = (props: NextButtonProps) => {
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
      <IconChevronCompactRight />
    </UnstyledButton>
  )
}
NextButton.displayName = "ImageDetailModal.Slide.NextButton"
