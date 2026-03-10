import { calcStorageUsage } from "@/lib/storage"
import {
  DEFAULT_FILE_SIZE_PREFIX,
  FileSizePrefix,
  transform,
} from "@/lib/transform"
import {
  Box,
  Divider,
  Flex,
  Group,
  Paper,
  PaperProps,
  Progress,
  Text,
  Title,
} from "@mantine/core"
import { IconDatabase } from "@tabler/icons-react"
import { ColorSwatchText } from "../ColorSwatchText"

export type StorageInfoPanelPayload = {
  used?: number
  capacity?: number
}

export interface StorageInfoPanelProps
  extends Omit<PaperProps, "shadow" | "withBorder"> {
  prefix?: FileSizePrefix
  payload?: StorageInfoPanelPayload
}

export const StorageInfoPanel = (props: StorageInfoPanelProps) => {
  const { payload, prefix = DEFAULT_FILE_SIZE_PREFIX, ...rest } = props
  const { capacity = 0, used = 0 } = payload ?? {}

  const storage = transform.storage({
    values: calcStorageUsage({ used, capacity }),
    prefix,
  })

  const label =
    `${storage.used.size.value} ${storage.used.size.unit}` +
    " / " +
    `${storage.capacity.size.value} ${storage.capacity.size.unit}` +
    `（ ${storage.used.percent} % ）`

  return (
    <Paper shadow="xs" withBorder {...rest}>
      <Group gap={4} p="xs">
        <IconDatabase size={16} />
        <Title order={6}>ストレージ</Title>
      </Group>
      <Divider />
      <Box
        p="xs"
        style={(theme) => ({
          display: "grid",
          gridTemplateColumns: "auto auto auto 1fr",
        })}
      >
        <Box
          style={{
            gridColumn: "span 4",
          }}
        >
          <Box mb="xs">
            <Flex justify="flex-end">
              <Text size="xs">{label}</Text>
            </Flex>
            <Progress.Root radius="xs">
              <Progress.Section value={storage.used.percent} color="blue" />
            </Progress.Root>
          </Box>
        </Box>
        <Box>
          <Text size="xs">容量</Text>
        </Box>
        <Box>
          <Text size="xs">：</Text>
        </Box>
        <Box style={{ gridColumn: "span 2" }}>
          <Text size="xs">{`${storage.capacity.size.value} ${storage.capacity.size.unit}`}</Text>
        </Box>

        <Box>
          <ColorSwatchText
            color="var(--mantine-color-blue-filled)"
            label="使用領域"
          />
        </Box>
        <Box>
          <Text size="xs">：</Text>
        </Box>
        <Box style={{ display: "flex", justifyContent: "end" }}>
          <Text size="xs">{`${storage.used.size.value} ${storage.used.size.unit}`}</Text>
        </Box>
        <Box>
          <Text size="xs">{`（ ${storage.used.percent} % ）`}</Text>
        </Box>

        <Box>
          <ColorSwatchText
            color="var(--mantine-color-dark-4)"
            label="空き領域"
          />
        </Box>
        <Box>
          <Text size="xs">：</Text>
        </Box>
        <Box style={{ display: "flex", justifyContent: "end" }}>
          <Text size="xs">{`${storage.availabled.size.value} ${storage.availabled.size.unit}`}</Text>
        </Box>
        <Box>
          <Text size="xs">{`（ ${storage.availabled.percent} % ）`}</Text>
        </Box>
      </Box>
    </Paper>
  )
}
