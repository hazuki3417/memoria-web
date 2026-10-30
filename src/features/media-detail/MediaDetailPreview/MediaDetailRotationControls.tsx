"use client"

import { ActionIcon, Group } from "@mantine/core"
import { IconRotate, IconRotate2 } from "@tabler/icons-react"
import type { Dispatch, SetStateAction } from "react"

/** Reuses the legacy Preview rotation controls without owning viewport state. */
export function MediaDetailRotationControls({
  setRotate,
  setAnimated,
}: {
  setRotate: Dispatch<SetStateAction<number>>
  setAnimated: Dispatch<SetStateAction<boolean>>
}) {
  return (
    <Group gap={4} wrap="nowrap" justify="flex-start">
      <ActionIcon variant="subtle" aria-label="回転をリセット" onClick={() => {
        setAnimated(false)
        setRotate(0)
      }}>
        <IconRotate2 size={18} />
      </ActionIcon>
      <ActionIcon variant="subtle" aria-label="左へ回転" onClick={() => {
        setAnimated(true)
        setRotate((value) => value - 90)
      }}>
        <IconRotate size={18} />
      </ActionIcon>
      <ActionIcon variant="subtle" aria-label="右へ回転" onClick={() => {
        setAnimated(true)
        setRotate((value) => value + 90)
      }}>
        <IconRotate size={18} style={{ transform: "scaleX(-1)" }} />
      </ActionIcon>
    </Group>
  )
}
