"use client"

import { Stack, Text } from "@mantine/core"
import { GroupPreviewGrid } from "@/components/GroupPreviewGrid"

type GroupItemProps = {
  name: string
  directMedia: string[]
  aggregateMedia?: string[]
  directMediaCount?: number
  gap?: number
}

/** Shared Group name and preview; screens own the outer surface and interactions. */
export function GroupItem({ name, directMedia, aggregateMedia, directMediaCount, gap = 6 }: GroupItemProps) {
  return (
    <Stack gap={gap}>
      <Text fw={600} size="sm" truncate="end" title={name}>{name}</Text>
      <GroupPreviewGrid directMedia={directMedia} aggregateMedia={aggregateMedia} directMediaCount={directMediaCount} />
    </Stack>
  )
}
