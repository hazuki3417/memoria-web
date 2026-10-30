import type { Meta, StoryObj } from "@storybook/react"
import { fn } from "storybook/test"
import { GroupDetailToolbar } from "./GroupDetailToolbar"

const meta = {
  title: "Features/Group Browser/GroupDetailToolbar",
  component: GroupDetailToolbar,
  args: {
    compact: false,
    selected: { name: "旅行の写真" },
    hideManagementActions: false,
    canManage: true,
    detailsReady: true,
    onEdit: fn(),
    onClose: fn(),
  },
} satisfies Meta<typeof GroupDetailToolbar>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = { tags: ["visual"] }
export const Compact: Story = { args: { compact: true }, tags: ["visual"] }
export const Loading: Story = {
  args: { detailsReady: false },
  tags: ["visual"],
}
export const ReadOnly: Story = { args: { canManage: false }, tags: ["visual"] }
export const HiddenManagement: Story = {
  args: { hideManagementActions: true },
  tags: ["visual"],
}
