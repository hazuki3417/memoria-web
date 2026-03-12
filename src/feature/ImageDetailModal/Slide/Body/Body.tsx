import { Box, type BoxProps } from "@mantine/core"
import type React from "react"
import { memo } from "react"
import { styles } from "../styles"
import { Center } from "./Center"
import { Left } from "./Left"
import { Right } from "./Right"

export interface BodyProps extends BoxProps {
  children: React.ReactNode
}

export const Body = (props: BodyProps) => {
  const { ...rest } = props
  return (
    <Box
      style={(theme) => ({
        display: "flex",
        height: `calc(100% - ${styles.NAVIGATION_HEIGHT * 2}px)`,
        width: "100%",
        flexDirection: "row",
      })}
      {...rest}
    />
  )
}
Body.Center = memo(Center)
Body.Left = memo(Left)
Body.Right = memo(Right)
