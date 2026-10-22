"use client"

import { Box, Center, Loader, Stack, Text } from "@mantine/core"
import { IconAlertCircle, IconPhotoOff, IconRefresh } from "@tabler/icons-react"
import { useState, type ReactNode } from "react"

export type MediaTileState =
  | { status: "ready"; src: string }
  | { status: "loading" }
  | { status: "processing" }
  | { status: "processing-error" }
  | { status: "source-unavailable" }
  | { status: "image-error" }

function TileMessage({ icon, title, description }: {
  icon: ReactNode
  title: string
  description?: string
}) {
  return (
    <Center h="100%" w="100%">
      <Stack align="center" gap={6} p="xs" c="dimmed">
        {icon}
        <Text size="xs" fw={600} ta="center">{title}</Text>
        {description && <Text size="10px" ta="center">{description}</Text>}
      </Stack>
    </Center>
  )
}

export function MediaTile({
  src,
  state,
  label,
  children,
}: {
  /** Legacy thumbnail input; consumers can adopt explicit state incrementally. */
  src?: string | null
  state?: MediaTileState
  label: string
  children?: ReactNode
}) {
  const resolved: MediaTileState = state ?? (
    src ? { status: "ready", src } : { status: "source-unavailable" }
  )
  const [failedSrc, setFailedSrc] = useState<string | null>(null)
  const imageSrc = resolved.status === "ready" ? resolved.src : null
  const imageFailed = imageSrc !== null && failedSrc === imageSrc

  return (
    <Box w="100%" h="100%" style={{
      position: "relative",
      overflow: "hidden",
      backgroundColor: "var(--mantine-color-default-hover)",
    }}>
      {!state && !src ? (
        <Text size="xs" c="dimmed" ta="center">{label}</Text>
      ) : resolved.status === "ready" && !imageFailed ? (
        <img
          key={resolved.src}
          src={resolved.src}
          alt={label}
          draggable={false}
          onError={() => setFailedSrc(resolved.src)}
          style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
        />
      ) : resolved.status === "loading" ? (
        <TileMessage icon={<Loader size="sm" />} title="読み込み中" />
      ) : resolved.status === "processing" ? (
        <TileMessage icon={<IconRefresh size={28} stroke={1.5} />} title="変換しています" />
      ) : resolved.status === "processing-error" ? (
        <TileMessage icon={<IconPhotoOff size={30} stroke={1.5} />} title="画像を表示できません" description="処理に失敗しました" />
      ) : resolved.status === "source-unavailable" ? (
        <TileMessage icon={<IconPhotoOff size={28} stroke={1.5} />} title="画像を取得できません" />
      ) : (
        <TileMessage icon={<IconAlertCircle size={28} stroke={1.5} />} title="画像を表示できません" />
      )}
      {children}
    </Box>
  )
}
