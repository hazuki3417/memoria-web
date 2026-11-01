import { Box, Center, Image, SimpleGrid } from "@mantine/core"
import { IconPhoto } from "@tabler/icons-react"

export function MediaPage({
  items,
  page,
  pageSize,
  mediaIds,
  onOpenMedia,
}: {
  items: string[]
  page: number
  pageSize: number
  mediaIds?: readonly string[]
  onOpenMedia?: (id: string) => void
}) {
  return (
    <SimpleGrid
      cols={pageSize}
      spacing="xs"
      verticalSpacing="xs"
      w="100%"
      style={{ flex: "0 0 50%", width: "50%" }}
    >
      {items
        .map((src, index) => ({
          src,
          slot: `page-${page}-slot-${index}`,
          index,
        }))
        .map(({ src, slot, index }) => (
          <Box
            key={slot}
            component={
              onOpenMedia && mediaIds?.[page * pageSize + index]
                ? "button"
                : "div"
            }
            type={
              onOpenMedia && mediaIds?.[page * pageSize + index]
                ? "button"
                : undefined
            }
            onClick={
              onOpenMedia
                ? () => {
                    const id = mediaIds?.[page * pageSize + index]
                    if (id) onOpenMedia(id)
                  }
                : undefined
            }
            aria-label={
              onOpenMedia && mediaIds?.[page * pageSize + index]
                ? `Mediaを表示: ${page * pageSize + index + 1}`
                : undefined
            }
            bdrs="md"
            style={{
              aspectRatio: "1 / 1",
              padding: 0,
              cursor:
                onOpenMedia && mediaIds?.[page * pageSize + index]
                  ? "pointer"
                  : "default",
              overflow: "hidden",
              border: "1px solid var(--mantine-color-default-border)",
              background: "var(--mantine-color-default-hover)",
            }}
          >
            {src ? (
              <Image
                src={src}
                alt={`最近のMedia ${page * pageSize + index + 1}`}
                w="100%"
                h="100%"
                fit="cover"
                draggable={false}
              />
            ) : (
              <Center h="100%" aria-label="サムネイルを表示できません">
                <IconPhoto
                  size={20}
                  stroke={1.5}
                  color="var(--mantine-color-dimmed)"
                />
              </Center>
            )}
          </Box>
        ))}
    </SimpleGrid>
  )
}
