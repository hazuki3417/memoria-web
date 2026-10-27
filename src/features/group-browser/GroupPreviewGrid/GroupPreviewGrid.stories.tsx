import type { Meta, StoryObj } from "@storybook/react"
import { GroupPreviewGrid } from "./GroupPreviewGrid"

const meta = {
  title: "Features/Group Browser/Preview Grid",
  component: GroupPreviewGrid,
  args: {
    count: 0,
  },
} satisfies Meta<typeof GroupPreviewGrid>

export default meta
type Story = StoryObj<typeof meta>

/** GB-080/083: direct Mediaが確定0件のPreview。 */
export const Empty: Story = {
  name: "Visual · Empty",
  tags: ["visual"],
}

/** GB-080: direct Mediaが1件のPreview。 */
export const OneDirectMedia: Story = {
  name: "Visual · One Direct Media",
  tags: ["visual"],
  args: { count: 1 },
}

/** GB-080: direct Mediaが3件のPreview。 */
export const ThreeDirectMedia: Story = {
  name: "Visual · Three Direct Media",
  tags: ["visual"],
  args: { count: 3 },
}

/** GB-080: direct Mediaが4件のPreview。 */
export const FourDirectMedia: Story = {
  name: "Visual · Four Direct Media",
  tags: ["visual"],
  args: { count: 4 },
}

/** GB-081: direct Mediaが5件以上の場合のContinuation Cue。 */
export const ContinuationCue: Story = {
  name: "Visual · Continuation Cue",
  tags: ["visual"],
  args: { count: 5 },
}

/** GB-084: remote画像がまだ取得できない場合は空と区別する。 */
export const RemotePreviewUnavailable: Story = {
  name: "Visual · Remote Preview Unavailable",
  tags: ["visual"],
  args: { count: 3, remote: true, sources: [] },
}
