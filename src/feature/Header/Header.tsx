"use client"
import { Box, Flex } from "@mantine/core"
import React from "react"

export interface HeaderProps {
  children: React.ReactNode
}

export const Header = (props: HeaderProps) => {
  const { children, ...rest } = props

  return (
    <Box
      pl={"lg"}
      pr={"lg"}
      style={(theme) => ({
        height: theme.other.app.header.height,
        backgroundColor: "var(--mantine-color-dark-8)",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
      })}
      {...rest}
    >
      <Flex gap={8} style={{ alignItems: "center" }}>
        <span>Memoria ver.β</span>
      </Flex>
      <Flex gap={8} style={{ alignItems: "center" }}>
        {children}
      </Flex>
    </Box>
  )
}
