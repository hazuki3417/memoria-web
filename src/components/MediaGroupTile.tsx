"use client"

import { Box, Center, Loader, Stack, Text } from "@mantine/core"
import { IconAlertCircle, IconLayersIntersect, IconRefresh } from "@tabler/icons-react"
import type { ReactNode } from "react"

export type MediaGroupTileState =
  | { status: "ready"; sources: string[] }
  | { status: "loading" }
  | { status: "processing" }
  | { status: "error" }

/**
 * Group identity is a mosaic of Media-sized cells, rather than a single image.
 * The same silhouette remains visible for empty artwork and every feedback state.
 */
function GroupIdentity({ children }: { children?: ReactNode }) {
  return (
    <Center w="100%" h="100%" style={{ gridColumn: "1 / -1", gridRow: "1 / -1" }}>
      <Box w="66%" maw={124} style={{ position: "relative", aspectRatio: "1 / 1" }}>
        <Box
          aria-hidden="true"
          style={{
            position: "absolute",
            inset: "9% 0 0 9%",
            display: "grid",
            gridTemplateColumns: "2fr 1fr",
            gridTemplateRows: "1fr 1fr",
            gap: 3,
            transform: "rotate(-7deg)",
          }}
        >
          {[0, 1, 2].map((cell) => (
            <Box
              key={cell}
              bdrs="xs"
              style={{
                gridRow: cell === 0 ? "1 / 3" : undefined,
                backgroundColor: "var(--mantine-color-default-border)",
                border: "1px solid var(--mantine-color-default-border)",
              }}
            />
          ))}
        </Box>
        <Center
          style={{
            position: "absolute",
            inset: "17% 8% 8% 17%",
            background: "var(--mantine-color-body)",
            border: "1px solid var(--mantine-color-default-border)",
            borderRadius: "var(--mantine-radius-md)",
            boxShadow: "var(--mantine-shadow-xs)",
          }}
        >
          {children ?? <IconLayersIntersect size={34} stroke={1.5} color="var(--mantine-color-text)" />}
        </Center>
      </Box>
    </Center>
  )
}

function GroupStatus({ icon, label }: { icon: ReactNode; label: string }) {
  return (
    <Box style={{ gridColumn: "1 / -1", gridRow: "1 / -1", position: "relative" }}>
      <Stack align="center" justify="center" h="100%" gap={6} p="xs">
        <Box w="100%" style={{ flex: "0 1 66%", minHeight: 0 }}>
          <GroupIdentity>{icon}</GroupIdentity>
        </Box>
        <Text size="xs" fw={600} c="dimmed" ta="center">{label}</Text>
      </Stack>
    </Box>
  )
}

/** Decorative artwork is not a list of direct Media memberships. */
export function MediaGroupTile({
  sources = [],
  state,
}: {
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
      {resolved.status === "ready" && resolved.sources.length > 0 ? (
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
      ) : resolved.status === "ready" ? (
        <GroupIdentity />
      ) : resolved.status === "loading" ? (
        <GroupStatus icon={<Loader size="sm" color="var(--mantine-color-text)" />} label="Groupを読み込んでいます" />
      ) : resolved.status === "processing" ? (
        <GroupStatus icon={<IconRefresh size={28} stroke={1.5} color="var(--mantine-color-text)" />} label="Groupを準備しています" />
      ) : (
        <GroupStatus icon={<IconAlertCircle size={28} stroke={1.5} color="var(--mantine-color-text)" />} label="Groupを表示できません" />
      )}
    </Box>
  )
}
