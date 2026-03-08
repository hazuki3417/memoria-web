import {
  Box,
  Divider,
  Flex,
  Group,
  Paper,
  Progress,
  Text,
  Title,
} from "@mantine/core"
import { IconDatabase } from "@tabler/icons-react"
import { ColorSwatchText } from "../ColorSwatchText"

export interface StorageInfoPanelProps {}

export const StorageInfoPanel = (props: StorageInfoPanelProps) => {
  return (
    <Paper shadow="xs" withBorder>
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
              <Text size="xs">10 MB / 1 GB （ 10 % ）</Text>
            </Flex>
            <Progress.Root radius="xs">
              <Progress.Section value={20} color="blue" />
            </Progress.Root>
          </Box>
        </Box>
        <Box>
          <Text size="xs">・容量</Text>
        </Box>
        <Box>
          <Text size="xs">：</Text>
        </Box>
        <Box style={{ gridColumn: "span 2" }}>
          <Text size="xs"> 1 GB</Text>
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
        <Box>
          <Text size="xs">100 MB</Text>
        </Box>
        <Box>
          <Text size="xs">（ 10 % ）</Text>
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
        <Box>
          <Text size="xs">100 MB</Text>
        </Box>
        <Box>
          <Text size="xs">（ 10 % ）</Text>
        </Box>
      </Box>
    </Paper>
  )
}
