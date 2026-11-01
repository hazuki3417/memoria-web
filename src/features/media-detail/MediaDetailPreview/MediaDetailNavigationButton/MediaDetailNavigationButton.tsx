"use client"

import { ActionIcon } from "@mantine/core"
import { IconChevronLeft, IconChevronRight } from "@tabler/icons-react"

/** Shared previous/next control; each consumer owns its navigation state. */
export function MediaDetailNavigationButton({
  direction,
  onNavigate,
}: {
  direction: -1 | 1
  onNavigate: () => void
}) {
  return (
    <ActionIcon
      variant="subtle"
      color="gray"
      size="lg"
      aria-label={direction === -1 ? "前のMedia" : "次のMedia"}
      onClick={onNavigate}
    >
      {direction === -1 ? <IconChevronLeft /> : <IconChevronRight />}
    </ActionIcon>
  )
}
