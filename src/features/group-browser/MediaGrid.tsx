"use client"

import { SimpleGrid, UnstyledButton } from "@mantine/core"
import { MediaTile } from "@/components/MediaTile"

const previewImages = Array.from(
  { length: 9 },
  (_, index) => `/__dev-assets/group-browser/group-media-${String(index + 1).padStart(2, "0")}.jpg`,
)

export function MediaGrid({
  onOpen,
  items,
}: {
  onOpen: (index: number) => void
  items?: Array<{ id: string; label: string; src: string | null }>
}) {
  // Local dummy thumbnails; actual Group media will be supplied by the Connection.
  const mediaItems =
    items ??
    Array.from({ length: 24 }, (_, index) => ({
      id: `media-${index + 1}`,
      label: `Media ${index + 1}`,
      src: previewImages[index % previewImages.length],
    }))
  return (
    <SimpleGrid cols={{ base: 2, sm: 3, lg: 4, xl: 5 }} spacing="sm">
      {mediaItems.map(({ id, label, src }, index) => (
        <UnstyledButton
          key={id}
          aria-label={
            src
              ? `${label}の詳細を開く`
              : `${label}の詳細を開く（画像プレビューなし）`
          }
          onClick={() => onOpen(index)}
          bdrs="sm"
          style={{
            display: "block",
            aspectRatio: "1 / 1",
            border: "1px solid var(--mantine-color-default-border)",
                      }}
        >
          <MediaTile src={src} label={label} />
        </UnstyledButton>
      ))}
    </SimpleGrid>
  )
}

