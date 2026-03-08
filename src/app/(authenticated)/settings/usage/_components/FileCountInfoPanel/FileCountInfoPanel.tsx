import { DonutChart } from "@mantine/charts"
import {
  Box,
  Divider,
  Group,
  Paper,
  PaperProps,
  Text,
  Title,
} from "@mantine/core"
import { IconFile } from "@tabler/icons-react"
import { ColorSwatchText } from "../ColorSwatchText"

export interface FileCountInfoPanelProps
  extends Omit<PaperProps, "shadow" | "withBorder"> {}

export const FileCountInfoPanel = (props: FileCountInfoPanelProps) => {
  const { ...rest } = props
  return (
    <Paper shadow="xs" withBorder {...props}>
      <Group gap={4} p="xs">
        <IconFile size={16} />
        <Title order={6}>ファイル数</Title>
      </Group>
      <Divider />
      <Group p="xs" display="flex" align="start">
        <Box>
          <DonutChart
            size={140}
            startAngle={90}
            endAngle={-270}
            withTooltip={false}
            chartLabel="200 件"
            data={[
              { name: "jpg", value: 200, color: "blue" },
              { name: "png", value: 200, color: "yellow" },
            ]}
          />
        </Box>
        <Box
          style={(theme) => ({
            display: "grid",
            gridTemplateColumns: "auto auto auto 1fr",
          })}
        >
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
            <Text size="xs">100 件</Text>
          </Box>
          <Box>
            <Text size="xs">（ 50 % ）</Text>
          </Box>

          <Box>
            <ColorSwatchText
              color="var(--mantine-color-yellow-filled)"
              label="png"
            />
          </Box>
          <Box>
            <Text size="xs">：</Text>
          </Box>
          <Box>
            <Text size="xs">100 件</Text>
          </Box>
          <Box>
            <Text size="xs">（ 50 % ）</Text>
          </Box>
        </Box>
      </Group>
    </Paper>
  )
}
