"use client"

import { Badge, Box, Group, Popover, Stack, Text } from "@mantine/core"
import { IconRefresh } from "@tabler/icons-react"
import { statusPresentation, type UploadFile } from "../uploadPrototypeStatus"

export function UploadStatus({ file }: { file: UploadFile }) {
  const presentation = statusPresentation[file.status]
  const StatusIcon = presentation.icon
  const badge = (
    <Badge
      variant="light"
      color={presentation.color}
      leftSection={<StatusIcon size={12} />}
      style={{ cursor: file.reason ? "pointer" : undefined }}
    >
      {presentation.label}
    </Badge>
  )

  return (
    <Group gap={4} wrap="nowrap" style={{ flex: "0 0 auto" }}>
      {file.reason ? (
        <Popover width={300} position="bottom-start" withArrow shadow="md">
          <Popover.Target>
            <Box
              component="button"
              type="button"
              p={0}
              bg="transparent"
              style={{ border: 0, cursor: "pointer" }}
            >
              {badge}
            </Box>
          </Popover.Target>
          <Popover.Dropdown>
            <Stack gap={4}>
              <Text size="sm" fw={600}>
                {presentation.label}
              </Text>
              <Text size="sm">{file.reason}</Text>
            </Stack>
          </Popover.Dropdown>
        </Popover>
      ) : (
        badge
      )}
      {file.status === "upload-failed" && (
        <Badge
          variant="outline"
          color="gray"
          leftSection={<IconRefresh size={12} />}
        >
          再試行可能
        </Badge>
      )}
    </Group>
  )
}
