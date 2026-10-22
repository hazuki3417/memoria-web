import type { Meta, StoryObj } from "@storybook/react"
import { MediaTile } from "./MediaTile"

const meta = {
  title: "Components/Media Tile",
  component: MediaTile,
  tags: ["visual"],
  parameters: { layout: "centered" },
  decorators: [(Story) => <div style={{ width: 200, height: 200 }}><Story /></div>],
  args: { src: "/__dev-assets/group-browser/group-media-01.jpg", label: "旅行の写真" },
} satisfies Meta<typeof MediaTile>

export default meta
type Story = StoryObj<typeof meta>
export const Thumbnail: Story = { name: "Visual · Ready Thumbnail" }
export const MissingThumbnail: Story = {
  name: "Visual · Missing Thumbnail",
  args: { src: null, state: { status: "source-unavailable" } },
}

export const Loading: Story = {
  name: "Visual · Loading",
  args: { state: { status: "loading" } },
}
export const Processing: Story = {
  name: "Visual · Processing",
  args: { state: { status: "processing" } },
}
export const ProcessingError: Story = {
  name: "Visual · Processing Error",
  args: { state: { status: "processing-error" } },
}
export const SourceUnavailable: Story = {
  name: "Visual · Source Unavailable",
  args: { state: { status: "source-unavailable" } },
}
export const ImageError: Story = {
  name: "Visual · Image Error",
  args: { state: { status: "image-error" } },
}
