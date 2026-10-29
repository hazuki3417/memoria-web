import type { Meta, StoryObj } from "@storybook/react"
import { expect, fn, userEvent, within } from "storybook/test"
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
export const Searching: Story = {
  args: { query: "旅行" },
  tags: ["visual"],
  play: async ({ canvasElement, args }) => {
    await userEvent.click(within(canvasElement).getByRole("button", { name: "検索文字列をクリア" }))
    await expect(args.onQueryChange).toHaveBeenCalledWith("")
  },
}
export const Compact: Story = { args: { compact: true }, tags: ["visual"] }
export const ReadOnly: Story = { args: { canManage: false }, tags: ["visual"] }
export const HiddenManagement: Story = { args: { hideManagementActions: true }, tags: ["visual"] }
