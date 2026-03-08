import { DonutChart } from "@mantine/charts"
import { Box, Divider, Group, Paper, Text, Title } from "@mantine/core"
import { IconScale } from "@tabler/icons-react"
import { ColorSwatchText } from "../ColorSwatchText"

export interface FileSizeInfoPanelProps {}

export const FileSizeInfoPanel = (props: FileSizeInfoPanelProps) => {
  return (
    <Paper shadow="xs" withBorder>
      <Group gap={4} p="xs">
        <IconScale size={16} />
        <Title order={6}>ファイルサイズ</Title>
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
