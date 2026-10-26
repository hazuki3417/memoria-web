import type { Meta, StoryObj } from "@storybook/react"
import { GroupDetailPane } from "./GroupDetailPane"
import { GroupRelationSection } from "./GroupRelationSection"
import { GroupRelationCandidateFeedback } from "./GroupRelationCandidateFeedback"
import { GroupMediaPageFeedback } from "./GroupMediaPageFeedback"

// Direct right-pane review: uses the real extracted Feature component, without the left discovery pane.
// The `vrt` tag remains absent until visual review is complete.
const selected = { name: "旅行の写真", mediaCount: 3 }
const media = [
  {
    id: "p1",
    label: "風景",
    src: "/__dev-assets/group-browser/group-media-01.jpg",
  },
  {
    id: "p2",
    label: "海",
    src: "/__dev-assets/group-browser/group-media-02.jpg",
  },
  {
    id: "p3",
    label: "街",
    src: "/__dev-assets/group-browser/group-media-03.jpg",
  },
]
const relations = (
  <GroupRelationSection
    opened
    parentNames={["家族"]}
    childNames={["風景", "海"]}
    onToggle={() => {}}
  />
)
const meta = {
  title: "Features/Group Browser/Detail Pane",
  component: GroupDetailPane,
  parameters: { layout: "fullscreen" },
  tags: ["visual"],
  args: {
    selected,
    mediaItemsData: media,
    mediaDetailState: "ready",
    mediaPageFeedback: <GroupMediaPageFeedback state="idle" />,
    relationCandidateFeedback: (
      <GroupRelationCandidateFeedback hasSelection canManage state="ready" />
    ),
    relationDetailSection: relations,
    hideManagementActions: false,
    canManage: true,
    detailsReady: true,
    onOpenMedia: () => {},
    onEdit: () => {},
    onClose: () => {},
  },
} satisfies Meta<typeof GroupDetailPane>
export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = { name: "Visual · Detail · With Media" }
export const NoMedia: Story = {
  name: "Visual · Detail · No Media",
  args: {
    selected: { name: selected.name, mediaCount: 0 },
    mediaItemsData: [],
  },
}
export const MediaLoading: Story = {
  name: "Visual · Detail · Media Initial Loading",
  args: { mediaDetailState: "loading", mediaItemsData: [] },
}
export const MediaError: Story = {
  name: "Visual · Detail · Media Load Error",
  args: { mediaDetailState: "error", onRetryGroupMedia: async () => {} },
}
export const MoreMediaLoading: Story = {
  name: "Visual · Detail · Media Loading More",
  args: { mediaPageFeedback: <GroupMediaPageFeedback state="loading" /> },
}
export const MoreMediaError: Story = {
  name: "Visual · Detail · Media Load More Error",
  args: {
    mediaPageFeedback: (
      <GroupMediaPageFeedback state="error" onRetry={() => {}} />
    ),
  },
}
export const RelationLoading: Story = {
  name: "Visual · Detail · Relation Candidates Loading",
  args: {
    relationCandidateFeedback: (
      <GroupRelationCandidateFeedback hasSelection canManage state="loading" />
    ),
    detailsReady: false,
  },
}
export const RelationError: Story = {
  name: "Visual · Detail · Relation Candidates Error",
  args: {
    relationCandidateFeedback: (
      <GroupRelationCandidateFeedback
        hasSelection
        canManage
        state="error"
        onRetry={async () => {}}
      />
    ),
    detailsReady: false,
  },
}
export const NoRelations: Story = {
  name: "Visual · Detail · No Relations",
  args: {
    relationDetailSection: (
      <GroupRelationSection
        opened
        parentNames={[]}
        childNames={[]}
        onToggle={() => {}}
      />
    ),
  },
}
export const ReadOnly: Story = {
  name: "Visual · Detail · Read Only",
  args: { canManage: false, hideManagementActions: true },
}

export const CompactDefault: Story = {
  name: "Visual · Compact · Detail With Media",
  args: { compact: true },
  parameters: { viewport: { defaultViewport: "mobile1" } },
}
export const CompactNoMedia: Story = {
  name: "Visual · Compact · Detail No Media",
  args: {
    compact: true,
    selected: { name: selected.name, mediaCount: 0 },
    mediaItemsData: [],
  },
  parameters: { viewport: { defaultViewport: "mobile1" } },
}
export const CompactMediaLoading: Story = {
  name: "Visual · Compact · Detail Media Initial Loading",
  args: { compact: true, mediaDetailState: "loading" },
  parameters: { viewport: { defaultViewport: "mobile1" } },
}
export const CompactMediaError: Story = {
  name: "Visual · Compact · Detail Media Load Error",
  args: {
    compact: true,
    mediaDetailState: "error",
    onRetryGroupMedia: async () => {},
  },
  parameters: { viewport: { defaultViewport: "mobile1" } },
}
export const CompactNoRelations: Story = {
  name: "Visual · Compact · Detail No Relations",
  args: {
    compact: true,
    relationDetailSection: (
      <GroupRelationSection
        opened
        parentNames={[]}
        childNames={[]}
        onToggle={() => {}}
      />
    ),
  },
  parameters: { viewport: { defaultViewport: "mobile1" } },
}
export const CompactReadOnly: Story = {
  name: "Visual · Compact · Detail Read Only",
  args: { compact: true, canManage: false, hideManagementActions: true },
  parameters: { viewport: { defaultViewport: "mobile1" } },
}

export const CompactMoreMediaLoading: Story = {
  name: "Visual · Compact · Detail Media Loading More",
  args: {
    compact: true,
    mediaPageFeedback: <GroupMediaPageFeedback state="loading" />,
  },
  parameters: { viewport: { defaultViewport: "mobile1" } },
}
export const CompactMoreMediaError: Story = {
  name: "Visual · Compact · Detail Media Load More Error",
  args: {
    compact: true,
    mediaPageFeedback: (
      <GroupMediaPageFeedback state="error" onRetry={() => {}} />
    ),
  },
  parameters: { viewport: { defaultViewport: "mobile1" } },
}
