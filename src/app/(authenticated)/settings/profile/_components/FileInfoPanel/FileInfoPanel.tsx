import { Box, Divider, Group, Paper, Text, Title } from "@mantine/core"
import { IconFile } from "@tabler/icons-react"
import { ColorSwatchText } from "../ColorSwatchText"

export interface FileInfoPanelProps {}

export const FileInfoPanel = (props: FileInfoPanelProps) => {
  return (
    <Paper shadow="xs" withBorder>
      <Group gap={4} p="xs">
        <IconFile size={16} />
        <Title order={6}>ファイル</Title>
      </Group>
      <Divider />
      <Box
        p="xs"
        style={(theme) => ({
          display: "grid",
          gridTemplateColumns: "auto auto auto 1fr auto auto auto 1fr",
        })}
      >
        <Box
          style={{
            gridColumn: "span 8",
          }}
        >
          <Box mb="xs"></Box>
        </Box>

        <Box>
          <ColorSwatchText
            color="var(--mantine-color-blue-filled)"
            label="jpg"
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
          <ColorSwatchText color="var(--mantine-color-dark-4)" label="png" />
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
