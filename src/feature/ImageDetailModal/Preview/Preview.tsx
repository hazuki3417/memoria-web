import { Image } from "@mantine/core"
import type React from "react"
import { useMemo } from "react"

export type PreviewPayload = {
  src: string
  alt: string
}

export type PreviewUi = {
  scale: number
  rotate: number
  action: "rotate" | "reset"
}

export interface PreviewProps {
  payload: PreviewPayload
  ui: PreviewUi
}

export const Preview = (props: PreviewProps) => {
  const { payload, ui } = props

  const transition: React.CSSProperties | undefined = useMemo(() => {
    return ui.action === "reset"
      ? undefined
      : { transition: "transform 0.3s ease" }
  }, [ui.action])

  return (
    <Image
      src={payload.src}
      alt={payload.alt}
      style={{
        maxHeight: "100%",
        maxWidth: "100%",
        objectFit: "contain",
        transform: `rotate(${ui.rotate}deg) scale(${ui.scale})`,
        ...transition,
      }}
    />
  )
}
