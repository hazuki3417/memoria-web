import type { Meta, StoryObj } from "@storybook/react"
import { CommunitySettings } from "@/features/community-settings/CommunitySettings"

const meta = {
  title: "Design Prototypes/Community Settings",
  component: CommunitySettings,
  parameters: { layout: "fullscreen" },
} satisfies Meta<typeof CommunitySettings>

export default meta
type Story = StoryObj<typeof meta>

export const Administrator: Story = { args: { role: "admin" } }
export const Member: Story = { args: { role: "member" } }
export const Compact: Story = {
  args: { role: "admin" },
  parameters: { viewport: { defaultViewport: "mobile1" } },
}
