import type { Meta, StoryObj } from "@storybook/react"
import { MediaBrowserPrototype } from "./MediaBrowserPrototype"

const meta = {
  title: "Design Prototypes/Media Browser",
  component: MediaBrowserPrototype,
  parameters: { layout: "fullscreen" },
} satisfies Meta<typeof MediaBrowserPrototype>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: { initialState: "default", contextKind: "personal" },
}
export const TagFiltered: Story = {
  args: { initialState: "tag-filtered", contextKind: "personal" },
}
export const TrueEmpty: Story = {
  args: { initialState: "true-empty", contextKind: "personal" },
}
export const FilteredEmpty: Story = {
  args: { initialState: "filtered-empty", contextKind: "personal" },
}
export const Loading: Story = {
  args: { initialState: "loading", contextKind: "personal" },
}
export const LoadError: Story = {
  args: { initialState: "error", contextKind: "personal" },
}
export const LoadingMore: Story = {
  args: { initialState: "loading-more", contextKind: "personal" },
}
export const LoadMoreError: Story = {
  args: { initialState: "load-more-error", contextKind: "personal" },
}
export const ProcessingFailure: Story = {
  args: { initialState: "processing-failure", contextKind: "personal" },
}
export const Selection: Story = {
  args: { initialState: "selection", contextKind: "personal" },
}
export const Detail: Story = {
  args: { initialState: "default", contextKind: "personal" },
  play: async ({ canvasElement }) => {
    const button = canvasElement.querySelector<HTMLButtonElement>(
      'button[aria-label="縦長 Media 1を開く"]',
    )
    button?.click()
  },
}
export const PortraitDetail: Story = {
  args: { initialState: "default", contextKind: "personal" },
  play: async ({ canvasElement }) => {
    canvasElement
      .querySelector<HTMLButtonElement>(
        'button[aria-label="縦長 Media 1を開く"]',
      )
      ?.click()
  },
}
export const LandscapeDetail: Story = {
  args: { initialState: "default", contextKind: "personal" },
  play: async ({ canvasElement }) => {
    canvasElement
      .querySelector<HTMLButtonElement>(
        'button[aria-label="横長 Media 1を開く"]',
      )
      ?.click()
  },
}
export const Community: Story = {
  args: { initialState: "default", contextKind: "community" },
}
export const CommunityDetail: Story = {
  args: { initialState: "default", contextKind: "community" },
  play: async ({ canvasElement }) => {
    canvasElement
      .querySelector<HTMLButtonElement>(
        'button[aria-label="縦長 Media 1を開く"]',
      )
      ?.click()
  },
}
export const CommunitySelection: Story = {
  args: { initialState: "selection", contextKind: "community" },
}

export const GroupDialog: Story = {
  args: {
    initialState: "selection",
    contextKind: "personal",
    initialDialog: "group",
  },
}
export const ShareDialog: Story = {
  args: {
    initialState: "selection",
    contextKind: "personal",
    initialDialog: "share",
  },
}
export const DeleteDialog: Story = {
  args: {
    initialState: "selection",
    contextKind: "personal",
    initialDialog: "delete",
  },
}
export const CompactDeleteDialog: Story = {
  args: {
    initialState: "selection",
    contextKind: "personal",
    initialDialog: "delete",
  },
  parameters: { viewport: { defaultViewport: "mobile1" } },
}

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
