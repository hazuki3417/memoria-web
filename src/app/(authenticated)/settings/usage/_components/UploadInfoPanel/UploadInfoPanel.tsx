import {
  Box,
  Divider,
  Group,
  Paper,
  PaperProps,
  Text,
  Title,
} from "@mantine/core"
import { IconUpload } from "@tabler/icons-react"

export type UploadInfoPanelPayload = {
  limitFiles?: number
  limitSize?: number
  allowType?: string[]
}

export interface UploadInfoPanelProps
  extends Omit<PaperProps, "shadow" | "withBorder"> {
  payload?: UploadInfoPanelPayload
}

export const UploadInfoPanel = (props: UploadInfoPanelProps) => {
  const { payload, ...rest } = props
  const { limitFiles = 0, limitSize = 0, allowType = [] } = payload ?? {}
  return (
    <Paper shadow="xs" withBorder {...rest}>
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
          <Text size="xs">{limitFiles} 件</Text>
        </Box>

        <Box>
          <Text size="xs">・ファイルサイズ</Text>
        </Box>
        <Box>
          <Text size="xs">：</Text>
        </Box>
        <Box>
          <Text size="xs">{limitSize} MB / 1 件</Text>
        </Box>

        <Box>
          <Text size="xs">・ファイルタイプ</Text>
        </Box>
        <Box>
          <Text size="xs">：</Text>
        </Box>
        <Box>
          <Text size="xs">{allowType.join(" / ")}</Text>
        </Box>
      </Box>
    </Paper>
  )
}
