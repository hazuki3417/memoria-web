import { Title, TitleProps } from "@mantine/core"
import React from "react"

export interface SettingSectionTitleProps extends Omit<TitleProps, "order"> {
  children: React.ReactNode
}

export const SettingSectionTitle = (props: SettingSectionTitleProps) => {
  const { children, ...rest } = props

  return (
    <Title order={2} {...rest}>
      {children}
    </Title>
  )
}
