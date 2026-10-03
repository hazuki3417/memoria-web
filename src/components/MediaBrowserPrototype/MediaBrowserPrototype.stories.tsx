import type { Meta, StoryObj } from "@storybook/react"
import { MediaBrowserPrototype } from "./MediaBrowserPrototype"

const meta = {
  title: "Design Prototypes/Media Browser",
  component: MediaBrowserPrototype,
  parameters: { layout: "fullscreen" },
} satisfies Meta<typeof MediaBrowserPrototype>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = { args: { initialState: "default", contextKind: "personal" } }
export const TagFiltered: Story = { args: { initialState: "tag-filtered", contextKind: "personal" } }
export const TrueEmpty: Story = { args: { initialState: "true-empty", contextKind: "personal" } }
export const FilteredEmpty: Story = { args: { initialState: "filtered-empty", contextKind: "personal" } }
export const Loading: Story = { args: { initialState: "loading", contextKind: "personal" } }
export const Error: Story = { args: { initialState: "error", contextKind: "personal" } }
export const LoadingMore: Story = { args: { initialState: "loading-more", contextKind: "personal" } }
export const LoadMoreError: Story = { args: { initialState: "load-more-error", contextKind: "personal" } }
export const ProcessingFailure: Story = { args: { initialState: "processing-failure", contextKind: "personal" } }
export const Selection: Story = { args: { initialState: "selection", contextKind: "personal" } }
export const Community: Story = { args: { initialState: "default", contextKind: "community" } }
export const CommunitySelection: Story = { args: { initialState: "selection", contextKind: "community" } }

export const Compact: Story = {
  args: { initialState: "default", contextKind: "personal" },
  parameters: { viewport: { defaultViewport: "mobile1" } },
}
export const CompactSelection: Story = {
  args: { initialState: "selection", contextKind: "personal" },
  parameters: { viewport: { defaultViewport: "mobile1" } },
}
export const CompactCommunity: Story = {
  args: { initialState: "default", contextKind: "community" },
  parameters: { viewport: { defaultViewport: "mobile1" } },
}
