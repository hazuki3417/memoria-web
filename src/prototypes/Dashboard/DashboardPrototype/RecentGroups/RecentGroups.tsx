import { SimpleGrid, Stack } from "@mantine/core"
import { GroupItem } from "@/components/GroupItem"
import { recentGroups } from "../dashboardPrototypeData"

export function RecentGroups() {
  return (
    <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="sm">
      {recentGroups.map((group) => (
        <Stack
          key={group.name}
          gap={8}
          p="xs"
          bdrs="md"
          bg="var(--mantine-color-default-hover)"
        >
          <GroupItem
            name={group.name}
            directMedia={group.media}
            aggregateMedia={Array.from(
              { length: 12 },
              (_, index) =>
                `/__dev-assets/group-browser/group-media-${String((index % 9) + 1).padStart(2, "0")}.jpg`,
            )}
            gap={8}
          />
        </Stack>
      ))}
    </SimpleGrid>
  )
}

