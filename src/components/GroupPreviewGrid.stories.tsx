import type { Meta, StoryObj } from "@storybook/react"
import { GroupPreviewGrid } from "./GroupPreviewGrid"
const images = ["/group-browser/group-media-01.jpg", "/group-browser/group-media-02.jpg", "/group-browser/group-media-03.jpg", "/group-browser/group-media-04.jpg", "/group-browser/group-media-05.jpg"]
const meta = { title: "Components/GroupPreviewGrid", component: GroupPreviewGrid, args: { directMedia: images.slice(0, 4) }, decorators: [(Story) => <div style={{ width: 220 }}><Story /></div>] } satisfies Meta<typeof GroupPreviewGrid>
export default meta
type Story = StoryObj<typeof meta>
export const Default: Story = { tags: ["visual"] }
export const Empty: Story = { args: { directMedia: [] }, tags: ["visual"] }
export const Overflow: Story = { args: { directMedia: images }, tags: ["visual"] }
export const Aggregated: Story = { args: { directMedia: images.slice(0, 1), aggregateMedia: images.slice(1) }, tags: ["visual"] }
