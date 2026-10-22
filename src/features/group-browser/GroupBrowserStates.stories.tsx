import type { Meta, StoryObj } from "@storybook/react"
import { userEvent, within } from "storybook/test"
import { GroupBrowser, type GroupBrowserGroup } from "./GroupBrowser"

// Reviewable screen states. Intentionally no VRT (visual) or interaction tags.
// All states render the production Feature; no alternate screen markup is introduced.
const sampleGroups: GroupBrowserGroup[] = [
  { id: "photos", name: "旅行の写真", mediaCount: 12, previewCount: 4, parentNames: [], childNames: ["風景"] },
  { id: "landscape", name: "風景", mediaCount: 4, previewCount: 3, parentNames: ["旅行の写真"], childNames: [] },
  { id: "new", name: "まだMediaのないGroup", mediaCount: 0, previewCount: 0, parentNames: [], childNames: [] },
]

const meta = {
  title: "Features/Group Browser/Screen States",
  component: GroupBrowser,
  parameters: { layout: "fullscreen" },
  args: {
    groupsData: sampleGroups,
    mediaItemsData: [],
    relationCandidates: sampleGroups.map((group) => group.name),
  },
} satisfies Meta<typeof GroupBrowser>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  name: "Default",
}

export const Empty: Story = {
  name: "Empty",
  args: { groupsData: [], relationCandidates: [] },
}

export const EmptyCommunityMember: Story = {
  name: "Empty · Community Member",
  args: {
    contextKind: "community",
    groupsData: [],
    relationCandidates: [],
    canManage: false,
    hideManagementActions: true,
  },
}

export const SearchEmpty: Story = {
  name: "Search Empty",
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await userEvent.type(canvas.getByPlaceholderText("Groupを検索"), "一致しない検索語{Enter}")
    await canvas.findByText("一致するGroupがありません")
  },
}

export const Loading: Story = {
  name: "Loading",
  args: { groupsData: [], discoveryState: "loading" },
}

export const Error: Story = {
  name: "Error / Retry",
  args: { groupsData: [], discoveryState: "error", onRetryDiscovery: () => {} },
}

export const CompactDefault: Story = {
  name: "Compact · Default",
  parameters: { viewport: { defaultViewport: "mobile1" } },
}

export const CompactEmpty: Story = {
  name: "Compact · Empty",
  args: { groupsData: [], relationCandidates: [] },
  parameters: { viewport: { defaultViewport: "mobile1" } },
}

export const CompactSearchEmpty: Story = {
  name: "Compact · Search Empty",
  parameters: { viewport: { defaultViewport: "mobile1" } },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await userEvent.type(canvas.getByPlaceholderText("Groupを検索"), "一致しない検索語{Enter}")
    await canvas.findByText("一致するGroupがありません")
  },
}

export const CompactLoading: Story = {
  name: "Compact · Loading",
  args: { groupsData: [], discoveryState: "loading" },
  parameters: { viewport: { defaultViewport: "mobile1" } },
}

export const CompactError: Story = {
  name: "Compact · Error / Retry",
  args: { groupsData: [], discoveryState: "error", onRetryDiscovery: () => {} },
  parameters: { viewport: { defaultViewport: "mobile1" } },
}

/** Render the real selected-Group view. The play function sets only the selected item. */
const selectedGroupPlay = async ({ canvasElement }: { canvasElement: HTMLElement }) => {
  const canvas = within(canvasElement)
  await userEvent.click(canvas.getByRole("button", { name: /旅行の写真/ }))
}
const emptyMediaGroupPlay = async ({ canvasElement }: { canvasElement: HTMLElement }) => {
  const canvas = within(canvasElement)
  await userEvent.click(canvas.getByRole("button", { name: /まだMediaのないGroup/ }))
}

const selectedMedia = [
  { id: "media-1", label: "旅先の風景", src: "/__dev-assets/group-browser/group-media-01.jpg" },
  { id: "media-2", label: "街並み", src: "/__dev-assets/group-browser/group-media-02.jpg" },
  { id: "media-3", label: "海岸", src: "/__dev-assets/group-browser/group-media-03.jpg" },
]

export const SelectedGroup: Story = {
  name: "Selected · With Media",
  args: { mediaItemsData: selectedMedia },
  play: selectedGroupPlay,
}

export const SelectedEmptyMedia: Story = {
  name: "Selected · No Media",
  play: emptyMediaGroupPlay,
}

export const SelectedMediaLoading: Story = {
  name: "Selected · Media Loading",
  args: { mediaDetailState: "loading", mediaItemsData: [] },
  play: selectedGroupPlay,
}

export const SelectedMediaError: Story = {
  name: "Selected · Media Error / Retry",
  args: { mediaDetailState: "error", mediaItemsData: [], onRetryGroupMedia: async () => {} },
  play: selectedGroupPlay,
}

export const SelectedMediaPageLoading: Story = {
  name: "Selected · More Media Loading",
  args: { mediaItemsData: selectedMedia, mediaPageState: "loading" },
  play: selectedGroupPlay,
}

export const SelectedMediaPageError: Story = {
  name: "Selected · More Media Error / Retry",
  args: { mediaItemsData: selectedMedia, mediaPageState: "error", onRetryMediaPage: () => {} },
  play: selectedGroupPlay,
}

export const SelectedRelationLoading: Story = {
  name: "Selected · Relation Loading",
  args: { mediaItemsData: selectedMedia, relationCandidateState: "loading", detailsReady: false },
  play: selectedGroupPlay,
}

export const SelectedRelationError: Story = {
  name: "Selected · Relation Error / Retry",
  args: { mediaItemsData: selectedMedia, relationCandidateState: "error", detailsReady: false, onRetryRelationCandidates: async () => {} },
  play: selectedGroupPlay,
}

export const SelectedCommunityMember: Story = {
  name: "Selected · Community Member",
  args: { contextKind: "community", canManage: false, hideManagementActions: true, mediaItemsData: selectedMedia },
  play: selectedGroupPlay,
}

export const CompactSelectedGroup: Story = {
  name: "Compact · Selected With Media",
  args: { mediaItemsData: selectedMedia },
  parameters: { viewport: { defaultViewport: "mobile1" } },
  play: selectedGroupPlay,
}

export const CompactSelectedEmptyMedia: Story = {
  name: "Compact · Selected No Media",
  parameters: { viewport: { defaultViewport: "mobile1" } },
  play: emptyMediaGroupPlay,
}

export const CompactSelectedMediaLoading: Story = {
  name: "Compact · Selected Media Loading",
  args: { mediaDetailState: "loading", mediaItemsData: [] },
  parameters: { viewport: { defaultViewport: "mobile1" } },
  play: selectedGroupPlay,
}

export const CompactSelectedMediaError: Story = {
  name: "Compact · Selected Media Error / Retry",
  args: { mediaDetailState: "error", mediaItemsData: [], onRetryGroupMedia: async () => {} },
  parameters: { viewport: { defaultViewport: "mobile1" } },
  play: selectedGroupPlay,
}

export const CompactSelectedRelationError: Story = {
  name: "Compact · Selected Relation Error / Retry",
  args: { mediaItemsData: selectedMedia, relationCandidateState: "error", detailsReady: false, onRetryRelationCandidates: async () => {} },
  parameters: { viewport: { defaultViewport: "mobile1" } },
  play: selectedGroupPlay,
}

export const CompactSelectedCommunityMember: Story = {
  name: "Compact · Selected Community Member",
  args: { contextKind: "community", canManage: false, hideManagementActions: true, mediaItemsData: selectedMedia },
  parameters: { viewport: { defaultViewport: "mobile1" } },
  play: selectedGroupPlay,
}
