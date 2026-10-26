"use client"

import { Box, Checkbox, Image, Stack, Text, Loader } from "@mantine/core"
import { IconPhotoOff } from "@tabler/icons-react"
import type { MediaItem } from "@/features/media-detail"

export function MediaTile({
  item,
  selecting,
  selected,
  onClick,
}: {
  item: MediaItem
  selecting: boolean
  selected: boolean
  onClick: () => void
}) {
  return (
    <Box
      component="button"
      type="button"
      onClick={onClick}
      aria-label={
        selecting
          ? `${item.label}を${selected ? "選択解除" : "選択"}`
          : `${item.label}を開く`
      }
      aria-pressed={selecting ? selected : undefined}
      w="100%"
      p={0}
      bdrs="md"
      style={{
        position: "relative",
        aspectRatio: "1 / 1",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        overflow: "hidden",
        border: "1px solid var(--mantine-color-default-border)",
        outline: selected
          ? "2px solid var(--mantine-color-blue-6)"
          : "2px solid transparent",
        outlineOffset: "-2px",
        background: "var(--mantine-color-gray-0)",
        boxShadow: selected
          ? "0 0 0 2px var(--mantine-color-blue-light)"
          : undefined,
        cursor: "pointer",
        transition: "box-shadow 120ms ease, transform 120ms ease",
        userSelect: "none",
      }}
    >
      {item.failed ? (
        <Stack align="center" justify="center" gap={6} p="sm" c="dimmed">
          <IconPhotoOff size={30} stroke={1.5} aria-hidden="true" />
          <Text size="xs" fw={600} ta="center">
            画像を表示できません
          </Text>
          <Text size="10px" ta="center">
            処理に失敗しました
          </Text>
        </Stack>
      ) : item.processing ? (
        <Stack align="center" justify="center" gap={6} p="sm" c="dimmed">
          <Loader size="sm" />
          <Text size="xs" ta="center">画像を処理しています</Text>
        </Stack>
      ) : !item.src ? (
        <Stack align="center" justify="center" gap={6} p="sm" c="dimmed">
          <IconPhotoOff size={30} stroke={1.5} aria-hidden="true" />
          <Text size="xs" ta="center">画像を表示できません</Text>
        </Stack>
      ) : (
        <Image
          src={item.src}
          alt={item.label}
          w="100%"
          h="100%"
          fit="cover"
          draggable={false}
        />
      )}

      {selecting && (
        <Box
          aria-hidden="true"
          style={{
            position: "absolute",
            inset: 0,
            background: selected ? "rgba(34, 139, 230, 0.08)" : "transparent",
          }}
        />
      )}

      {selecting && (
        <Checkbox
          checked={selected}
          readOnly
          size="sm"
          color="blue"
          aria-hidden="true"
          tabIndex={-1}
          styles={{
            input: {
              backgroundColor: selected ? undefined : "transparent",
              borderColor: selected ? undefined : "rgba(255, 255, 255, 0.92)",
              boxShadow: selected ? undefined : "0 1px 3px rgba(0, 0, 0, 0.45)",
            },
          }}
          style={{
            position: "absolute",
            top: 8,
            left: 8,
            pointerEvents: "none",
          }}
        />
      )}
    </Box>
  )
}
