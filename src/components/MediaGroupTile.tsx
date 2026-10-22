"use client"

import { Box, Center, Loader, Stack, Text } from "@mantine/core"
import { IconAlertCircle, IconFolder, IconFolders } from "@tabler/icons-react"
import type { ReactNode } from "react"

export type MediaGroupTileState =
  | { status: "ready"; sources: string[] }
  | { status: "loading" }
  | { status: "processing" }
  | { status: "error" }

function GroupStateMessage({ icon, message }: { icon: ReactNode; message: string }) {
  return (
    <Center w="100%" h="100%" style={{ gridColumn: "1 / -1", gridRow: "1 / -1" }}>
      <Stack align="center" gap={8} p="xs" c="dimmed">
        {icon}
        <Text size="xs" fw={600} ta="center">{message}</Text>
      </Stack>
    </Center>
  )
}

/** Group artwork is decorative; its thumbnail images do not signify direct Media membership. */
export function MediaGroupTile({
  sources = [],
  state,
}: {
  /** Retained for consumers that already supply decorative artwork. */
  sources?: string[]
  state?: MediaGroupTileState
}) {
  const resolved: MediaGroupTileState = state ?? { status: "ready", sources }
  return (
    <Box
      w="100%"
      h="100%"
      bg="var(--mantine-color-default-hover)"
      style={{
        display: "grid",
        gridTemplateColumns: "2fr 1fr",
        gridTemplateRows: "1fr 1fr",
        gap: 2,
        overflow: "hidden",
      }}
    >
      {resolved.status === "ready" ? (
        resolved.sources.slice(0, 3).map((source, index) => (
          <Box
            key={index}
            style={{
              gridRow: index === 0 ? "1 / 3" : undefined,
              backgroundImage: `url("${source}")`,
              backgroundPosition: "center",
              backgroundSize: "cover",
            }}
          />
        ))
      ) : resolved.status === "loading" ? (
        <GroupStateMessage icon={<Stack align="center" gap={4}><IconFolder size={28} stroke={1.5} /><Loader size="xs" color="var(--mantine-color-text)" /></Stack>} message="Groupを読み込んでいます" />
      ) : resolved.status === "processing" ? (
        <GroupStateMessage icon={<IconFolders size={30} stroke={1.5} />} message="Groupを準備しています" />
      ) : (
        <GroupStateMessage icon={<IconAlertCircle size={28} stroke={1.5} />} message="Groupを表示できません" />
      )}
    </Box>
  )
}
