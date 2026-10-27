import type { Meta, StoryObj } from "@storybook/react"
import { fn } from "storybook/test"
import { MediaBrowserSelectionCount } from "./MediaBrowserSelectionCount"

const meta = {
  title: "Features/Media Browser/MediaBrowserSelectionCount",
  component: MediaBrowserSelectionCount,
  args: { count: 0 },
} satisfies Meta<typeof MediaBrowserSelectionCount>

export default meta
type Story = StoryObj<typeof meta>

export const Empty: Story = { tags: ["visual"] }
export const Selected: Story = { args: { count: 3 }, tags: ["visual"] }
export const ManySelected: Story = { args: { count: 100 }, tags: ["visual"] }
