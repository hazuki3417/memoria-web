import type { Meta, StoryObj } from "@storybook/react"
import { GroupDetailPane } from "./GroupDetailPane"
import { GroupRelationSection } from "./GroupRelationSection"
import { GroupRelationCandidateFeedback } from "./GroupRelationCandidateFeedback"
import { GroupMediaPageFeedback } from "./GroupMediaPageFeedback"

// Direct right-pane review: uses the real extracted Feature component, without the left discovery pane.
// No VRT tags until visual review is complete.
const selected = { name: "旅行の写真", mediaCount: 3 }
const media = [
  { id: "p1", label: "風景", src: "/__dev-assets/group-browser/group-media-01.jpg" },
  { id: "p2", label: "海", src: "/__dev-assets/group-browser/group-media-02.jpg" },
  { id: "p3", label: "街", src: "/__dev-assets/group-browser/group-media-03.jpg" },
]
const relations = <GroupRelationSection opened parentNames={["家族"]} childNames={["風景", "海"]} onToggle={() => {}} />
const meta = {
  title: "Features/Group Browser/Detail Pane",
  component: GroupDetailPane,
  parameters: { layout: "fullscreen" },
  args: {
    selected,
    mediaItemsData: media,
    mediaDetailState: "ready",
    mediaPageFeedback: <GroupMediaPageFeedback state="idle" />,
    relationCandidateFeedback: <GroupRelationCandidateFeedback hasSelection canManage state="ready" />,
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

export const Default: Story = { name: "With Media" }
export const NoMedia: Story = { name: "No Media", args: { selected: { name: selected.name, mediaCount: 0 }, mediaItemsData: [] } }
export const MediaLoading: Story = { name: "Media Loading", args: { mediaDetailState: "loading", mediaItemsData: [] } }
export const MediaError: Story = { name: "Media Error / Retry", args: { mediaDetailState: "error", onRetryGroupMedia: async () => {} } }
export const MoreMediaLoading: Story = { name: "More Media Loading", args: { mediaPageFeedback: <GroupMediaPageFeedback state="loading" /> } }
export const MoreMediaError: Story = { name: "More Media Error / Retry", args: { mediaPageFeedback: <GroupMediaPageFeedback state="error" onRetry={() => {}} /> } }
export const RelationLoading: Story = { name: "Relation Loading", args: { relationCandidateFeedback: <GroupRelationCandidateFeedback hasSelection canManage state="loading" />, detailsReady: false } }
export const RelationError: Story = { name: "Relation Error / Retry", args: { relationCandidateFeedback: <GroupRelationCandidateFeedback hasSelection canManage state="error" onRetry={async () => {}} />, detailsReady: false } }
export const NoRelations: Story = { name: "No Relations", args: { relationDetailSection: <GroupRelationSection opened parentNames={[]} childNames={[]} onToggle={() => {}} /> } }
export const ReadOnly: Story = { name: "Read Only", args: { canManage: false, hideManagementActions: true } }

export const CompactDefault: Story = { name: "Compact · With Media", args: { compact: true }, parameters: { viewport: { defaultViewport: "mobile1" } } }
export const CompactNoMedia: Story = { name: "Compact · No Media", args: { compact: true, selected: { name: selected.name, mediaCount: 0 }, mediaItemsData: [] }, parameters: { viewport: { defaultViewport: "mobile1" } } }
export const CompactMediaLoading: Story = { name: "Compact · Media Loading", args: { compact: true, mediaDetailState: "loading" }, parameters: { viewport: { defaultViewport: "mobile1" } } }
export const CompactMediaError: Story = { name: "Compact · Media Error / Retry", args: { compact: true, mediaDetailState: "error", onRetryGroupMedia: async () => {} }, parameters: { viewport: { defaultViewport: "mobile1" } } }
export const CompactNoRelations: Story = { name: "Compact · No Relations", args: { compact: true, relationDetailSection: <GroupRelationSection opened parentNames={[]} childNames={[]} onToggle={() => {}} /> }, parameters: { viewport: { defaultViewport: "mobile1" } } }
export const CompactReadOnly: Story = { name: "Compact · Read Only", args: { compact: true, canManage: false, hideManagementActions: true }, parameters: { viewport: { defaultViewport: "mobile1" } } }
