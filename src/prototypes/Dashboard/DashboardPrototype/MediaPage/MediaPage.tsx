import { Box, Image, SimpleGrid } from "@mantine/core"
import type { media } from "../dashboardPrototypeData"

export function MediaPage({
  items,
  page,
  pageSize,
  columns,
}: {
  items: typeof media
  page: number
  pageSize: number
  columns: number
}) {
  return (
    <SimpleGrid
      cols={columns}
      spacing="xs"
      verticalSpacing="xs"
      w="100%"
      style={{ flex: "0 0 50%", width: "50%" }}
    >
      {items.map((item, index) => (
        <Box
          key={item.id}
          bdrs="md"
          style={{
            aspectRatio: "1 / 1",
            overflow: "hidden",
            border: "1px solid var(--mantine-color-default-border)",
            background: "var(--mantine-color-default-hover)",
          }}
        >
          <Image
            src={item.src}
            alt={`最近のMedia ${page * pageSize + index + 1}`}
            w="100%"
            h="100%"
            fit="cover"
            draggable={false}
          />
        </Box>
      ))}
    </SimpleGrid>
  )
}

