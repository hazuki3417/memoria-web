import type { Meta, StoryObj } from "@storybook/react"
import { fn } from "storybook/test"
import { GroupBrowserToolbar } from "./GroupBrowserToolbar"

const meta = {
  title: "Features/Group Browser/GroupBrowserToolbar",
  component: GroupBrowserToolbar,
  args: {
    compact: false,
    query: "",
    onQueryChange: fn(),
    onSearch: fn(),
    hideManagementActions: false,
    canManage: true,
    onCreate: fn(),
  },
} satisfies Meta<typeof GroupBrowserToolbar>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = { tags: ["visual"] }
export const Searching: Story = { args: { query: "旅行" }, tags: ["visual"] }
export const Compact: Story = { args: { compact: true }, tags: ["visual"] }
export const ReadOnly: Story = { args: { canManage: false }, tags: ["visual"] }
export const HiddenManagement: Story = { args: { hideManagementActions: true }, tags: ["visual"] }
