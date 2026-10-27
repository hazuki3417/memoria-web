"use client"

import { Group, UnstyledButton } from "@mantine/core"
import { IconArrowDown, IconArrowsSort, IconArrowUp } from "@tabler/icons-react"
import type { UsageSortDirection } from "../sortUsageFormats"

type UsageSortHeaderProps = {
  label: string
  direction: UsageSortDirection | null
  align: "left" | "right"
  disabled: boolean
  onSort: () => void
}

export function UsageSortHeader({
  label,
  direction,
  align,
  disabled,
  onSort,
}: UsageSortHeaderProps) {
  let Icon = IconArrowsSort

  if (direction === "asc") {
    Icon = IconArrowUp
  } else if (direction === "desc") {
    Icon = IconArrowDown
  }

  return (
    <UnstyledButton
      onClick={onSort}
      disabled={disabled}
      aria-label={`${label}で並べ替え`}
      style={{
        font: "inherit",
        fontWeight: "inherit",
        width: "100%",
        textAlign: align,
      }}
    >
      <Group
        gap={4}
        wrap="nowrap"
        justify={align === "left" ? "flex-start" : "flex-end"}
      >
        <span>{label}</span>
        <Icon
          size={14}
          stroke={1.75}
          aria-hidden="true"
          data-testid={`usage-sort-icon-${direction ?? "none"}`}
          style={{
            flexShrink: 0,
            color:
              direction === null
                ? "var(--mantine-color-dimmed)"
                : "var(--mantine-primary-color-filled)",
          }}
        />
      </Group>
    </UnstyledButton>
  )
}
