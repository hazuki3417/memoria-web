"use client"

import { Box, NavLink } from "@mantine/core"
import type { ComponentType } from "react"

export type NavigationItemProps = {
  label: string
  icon: ComponentType<{
    size?: number
    stroke?: number
    "aria-hidden"?: boolean
  }>
  active?: boolean
  disabled?: boolean
  accentColor?: string
  onClick?: () => void
}

export function NavigationItem({
  label,
  icon: Icon,
  active = false,
  disabled = false,
  accentColor = "var(--mantine-primary-color-filled)",
  onClick,
}: NavigationItemProps) {
  return (
    <Box pos="relative" pl={8}>
      {active && (
        <Box
          pos="absolute"
          top={3}
          bottom={3}
          left={0}
          w={3}
          bg={accentColor}
          style={{
            borderRadius: "var(--mantine-radius-xl)",
            pointerEvents: "none",
          }}
          aria-hidden="true"
        />
      )}
      <NavLink
        label={label}
        leftSection={<Icon size={16} stroke={1.6} aria-hidden="true" />}
        active={active}
        disabled={disabled}
        onClick={onClick}
        variant="subtle"
        color="gray"
        styles={{
          root: {
            borderRadius: "var(--mantine-radius-sm)",
            background: active
              ? "var(--mantine-color-default-hover)"
              : undefined,
            padding: "5px 8px",
            minHeight: 32,
            fontWeight: active ? 600 : 400,
          },
          section: {
            color: "var(--mantine-color-dimmed)",
            marginInlineEnd: 8,
          },
          label: {
            fontSize: "var(--mantine-font-size-sm)",
            lineHeight: 1.3,
          },
        }}
      />
    </Box>
  )
}
