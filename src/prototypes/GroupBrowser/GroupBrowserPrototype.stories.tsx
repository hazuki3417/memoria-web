import type { Meta, StoryObj } from "@storybook/react"
import { GroupBrowser } from "@/features/group-browser/GroupBrowser"

const meta = {
  title: "Design Prototypes/Group Browser",
  component: GroupBrowser,
  parameters: { layout: "fullscreen", applicationShell: true },
} satisfies Meta<typeof GroupBrowser>

export default meta
type Story = StoryObj<typeof meta>

export const Wide: Story = {}

export const Compact: Story = {
  parameters: { viewport: { defaultViewport: "mobile1" } },
}
