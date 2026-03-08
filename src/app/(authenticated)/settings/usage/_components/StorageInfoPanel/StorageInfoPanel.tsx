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

export interface StorageInfoPanelProps
  extends Omit<PaperProps, "shadow" | "withBorder"> {}

export const StorageInfoPanel = (props: StorageInfoPanelProps) => {
  const { ...rest } = props
  return (
    <Paper shadow="xs" withBorder {...props}>
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
              <Text size="xs">200 MB / 1 GB （ 20 % ）</Text>
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
          <Text size="xs">200 MB</Text>
        </Box>
        <Box>
          <Text size="xs">（ 20 % ）</Text>
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
          <Text size="xs">800 MB</Text>
        </Box>
        <Box>
          <Text size="xs">（ 80 % ）</Text>
        </Box>
      </Box>
    </Paper>
  )
}
