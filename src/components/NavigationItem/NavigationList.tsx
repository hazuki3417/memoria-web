"use client"

import { Stack } from "@mantine/core"
import type { ComponentType } from "react"
import { NavigationItem } from "./NavigationItem"

export type NavigationListItem<Id extends string = string> = {
  id: Id
  label: string
  icon: ComponentType<{
    size?: number
    stroke?: number
    "aria-hidden"?: boolean
  }>
  active?: boolean
  disabled?: boolean
}

export type NavigationListProps<Id extends string> = {
  items: readonly NavigationListItem<Id>[]
  accentColor: string
  onSelect: (id: Id, active: boolean) => void
}

/** Share item rendering and disabled handling without owning navigation or drawer behavior. */
export function NavigationList<Id extends string>({
  items,
  accentColor,
  onSelect,
}: NavigationListProps<Id>) {
  return (
    <Stack gap={0}>
      {items.map((item) => (
        <NavigationItem
          key={item.id}
          label={item.label}
          icon={item.icon}
          active={item.active}
          disabled={item.disabled}
          accentColor={accentColor}
          onClick={() => {
            if (!item.disabled) onSelect(item.id, Boolean(item.active))
          }}
        />
      ))}
    </Stack>
  )
}
