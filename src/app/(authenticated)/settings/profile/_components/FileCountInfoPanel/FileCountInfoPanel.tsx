import { DonutChart } from "@mantine/charts"
import { Box, Divider, Group, Paper, Text, Title } from "@mantine/core"
import { IconFile } from "@tabler/icons-react"
import { ColorSwatchText } from "../ColorSwatchText"

export interface FileCountInfoPanelProps {}

export const FileCountInfoPanel = (props: FileCountInfoPanelProps) => {
  return (
    <Paper shadow="xs" withBorder>
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
            chartLabel="100"
            data={[
              { name: "USA", value: 200, color: "blue" },
              { name: "Other", value: 200, color: "dark.4" },
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
            <Text size="xs">（ 10 % ）</Text>
          </Box>

          <Box>
            <ColorSwatchText color="var(--mantine-color-dark-4)" label="png" />
          </Box>
          <Box>
            <Text size="xs">：</Text>
          </Box>
          <Box>
            <Text size="xs">100 件</Text>
          </Box>
          <Box>
            <Text size="xs">（ 10 % ）</Text>
          </Box>
        </Box>
      </Group>
    </Paper>
  )
}
