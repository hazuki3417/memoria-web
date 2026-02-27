import { Image, Box } from "@mantine/core"
import React from "react"

export interface ImageTileProps {
  src?: string
  alt?: string
}

export const ImageTile = (props: ImageTileProps) => {
  const { src, alt } = props

  /**
   * 画像本体はポインタによるイベントをすべて無効化する
   * - 選択無効化(UX向上目的)
   * - ドラッグ & ドロップ無効化(UX向上目的)
   * - 画像保存無効化（小さな抵抗）
   */
  return (
    <Box
      style={(theme) => ({
        position: "relative",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        height: "160px",
        width: "160px",
        borderRadius: theme.radius.sm,
        userSelect: "none",
      })}
    >
      <Image
        src={src}
        alt={alt}
        style={(theme) => ({
          width: "unset",
          height: "unset",
          maxWidth: "100%",
          maxHeight: "100%",
          userSelect: "none",
          pointerEvents: "none",
        })}
      />
    </Box>
  )
}
