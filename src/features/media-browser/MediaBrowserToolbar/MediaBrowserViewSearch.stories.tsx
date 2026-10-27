import type { Meta, StoryObj } from "@storybook/react"
import { fn } from "storybook/test"
import { MediaBrowserViewSearch } from "./MediaBrowserViewSearch"

const meta = {
  title: "Features/Media Browser/MediaBrowserViewSearch",
  component: MediaBrowserViewSearch,
  args: { compact: false, tags: [], onTagsChange: fn(), onSubmitTags: fn(), tagOptions: ["旅行", "風景", "人物"] },
} satisfies Meta<typeof MediaBrowserViewSearch>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = { tags: ["visual"] }
export const WithTags: Story = { args: { tags: ["旅行", "風景"] }, tags: ["visual"] }
export const Compact: Story = { args: { compact: true }, tags: ["visual"] }
