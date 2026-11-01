import { SimpleGrid, Stack, Text } from "@mantine/core"
import { GroupPreviewGrid } from "@/features/group-browser/GroupPreviewGrid"
import type { DashboardGroup } from "../dashboardTypes"

export function RecentGroups({ groups }: { groups: DashboardGroup[] }) {
  return (
    <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="sm">
      {groups.map((group) => (
        <Stack
          key={group.id}
          gap={8}
          p="xs"
          bdrs="md"
          bg="var(--mantine-color-default-hover)"
        >
          <Text size="sm">{group.name}</Text>
          <GroupPreviewGrid
            count={group.mediaCount}
            sources={group.media}
            remote
          />
        </Stack>
      ))}
    </SimpleGrid>
  )
}
