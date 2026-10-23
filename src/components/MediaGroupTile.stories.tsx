import type { Meta, StoryObj } from "@storybook/react"
import { MediaGroupTile } from "./MediaGroupTile"

const images = [
  "/__dev-assets/group-browser/group-media-01.jpg",
  "/__dev-assets/group-browser/group-media-02.jpg",
  "/__dev-assets/group-browser/group-media-03.jpg",
]

const meta = {
  title: "Components/Media Group Tile",
  component: MediaGroupTile,
  tags: ["visual"],
  parameters: { layout: "centered" },
  decorators: [(Story) => <div style={{ width: 200, height: 200 }}><Story /></div>],
  args: { sources: images },
} satisfies Meta<typeof MediaGroupTile>

export default meta
type Story = StoryObj<typeof meta>

export const NoArtwork: Story = {
  name: "Visual · Zero Images",
  args: { sources: [] },
}
export const OneImage: Story = {
  name: "Visual · One Image",
  args: { sources: images.slice(0, 1) },
}
export const TwoImages: Story = {
  name: "Visual · Two Images",
  args: { sources: images.slice(0, 2) },
}
export const ThreeImages: Story = {
  name: "Visual · Three Images",
}
export const MoreThanThreeImages: Story = {
  name: "Visual · More Than Three Images",
  args: { sources: [...images, images[0]] },
}
