"use client"

import { ActionIcon, Slider } from "@mantine/core"
import { IconZoomIn, IconZoomOut, IconZoomReset } from "@tabler/icons-react"
import type { Dispatch, SetStateAction } from "react"
import { ZoomInput } from "./ZoomInput"

/** Exact zoom controls extracted from the existing MediaDetailPreview toolbar. */
export function MediaDetailZoomControls({
  zoom,
  setZoom,
}: {
  zoom: number
  setZoom: Dispatch<SetStateAction<number>>
}) {
  return (
    <>
      <ActionIcon variant="subtle" aria-label="拡大率をリセット" onClick={() => setZoom(100)}>
        <IconZoomReset size={18} />
      </ActionIcon>
      <ActionIcon variant="subtle" aria-label="縮小" disabled={zoom <= 50}
        onClick={() => setZoom((value) => Math.max(50, value - 10))}>
        <IconZoomOut size={18} />
      </ActionIcon>
      <Slider w={100} size="xs" min={50} max={300} step={10}
        value={zoom} onChange={setZoom} label={null} />
      <ActionIcon variant="subtle" aria-label="拡大" disabled={zoom >= 300}
        onClick={() => setZoom((value) => Math.min(300, value + 10))}>
        <IconZoomIn size={18} />
      </ActionIcon>
      <ZoomInput value={zoom} onChange={setZoom} />
    </>
  )
}
