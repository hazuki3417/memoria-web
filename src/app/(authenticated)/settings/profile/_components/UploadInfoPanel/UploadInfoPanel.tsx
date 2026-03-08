import { Box, Divider, Group, Paper, Text, Title } from "@mantine/core"
import { IconUpload } from "@tabler/icons-react"

export interface UploadInfoPanelProps {}

export const UploadInfoPanel = (props: UploadInfoPanelProps) => {
  return (
    <Paper shadow="xs" withBorder>
      <Group gap={4} p="xs">
        <IconUpload size={16} />
        <Title order={6}>アップロード</Title>
      </Group>
      <Divider />
      <Box
        p="xs"
        style={(theme) => ({
          display: "grid",
          gridTemplateColumns: "auto auto 1fr",
        })}
      >
        <Box>
          <Text size="xs">・ファイル数</Text>
        </Box>
        <Box>
          <Text size="xs">：</Text>
        </Box>
        <Box>
          <Text size="xs">20 件</Text>
        </Box>

        <Box>
          <Text size="xs">・ファイルサイズ</Text>
        </Box>
        <Box>
          <Text size="xs">：</Text>
        </Box>
        <Box>
          <Text size="xs">100 MB / 1 件</Text>
        </Box>

        <Box>
          <Text size="xs">・ファイルタイプ</Text>
        </Box>
        <Box>
          <Text size="xs">：</Text>
        </Box>
        <Box>
          <Text size="xs">jpg / png</Text>
        </Box>
      </Box>
    </Paper>
  )
}
