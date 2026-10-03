import { Box, Stack, Text } from "@mantine/core"
import type { Meta, StoryObj } from "@storybook/react"
import { SplitView } from "./SplitView"

function SplitViewPreview({
  defaultLayout = { primary: 36, secondary: 64 },
}: {
  defaultLayout?: { primary: number; secondary: number }
}) {
  return (
    <Box h={420} p="lg">
      <SplitView.Root defaultLayout={defaultLayout}>
        <SplitView.Pane id="primary" minSize={24}>
          <Stack h="100%" p="md" gap="xs">
            <Text fw={600}>Primary pane</Text>
            <Text size="sm" c="dimmed">
              Separatorをドラッグして幅を変更できます。
            </Text>
          </Stack>
        </SplitView.Pane>
        <SplitView.Separator />
        <SplitView.Pane id="secondary" minSize={36}>
          <Stack h="100%" p="md" gap="xs">
            <Text fw={600}>Secondary pane</Text>
            <Text size="sm" c="dimmed">
              Paneの最小幅は利用側が用途に応じて指定します。
            </Text>
          </Stack>
        </SplitView.Pane>
      </SplitView.Root>
    </Box>
  )
}

const meta = {
  title: "Components/Split View",
  component: SplitViewPreview,
  parameters: { layout: "fullscreen" },
} satisfies Meta<typeof SplitViewPreview>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const Equal: Story = {
  args: { defaultLayout: { primary: 50, secondary: 50 } },
}
