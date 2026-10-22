import type { Meta, StoryObj } from "@storybook/react"
import { MediaGroupTile } from "./MediaGroupTile"

const meta = {
  title: "Components/Media Group Tile",
  component: MediaGroupTile,
  tags: ["visual"],
  parameters: { layout: "centered" },
  decorators: [(Story) => <div style={{ width: 200, height: 200 }}><Story /></div>],
  args: { sources: [
    "/__dev-assets/group-browser/group-media-01.jpg",
    "/__dev-assets/group-browser/group-media-02.jpg",
    "/__dev-assets/group-browser/group-media-03.jpg",
  ] },
} satisfies Meta<typeof MediaGroupTile>

export default meta
type Story = StoryObj<typeof meta>
export const Artwork: Story = { name: "Visual · Ready Artwork" }
export const NoArtwork: Story = { name: "Visual · No Artwork", args: { sources: [] } }

export const Loading: Story = {
  name: "Visual · Loading",
  args: { state: { status: "loading" } },
}
export const Processing: Story = {
  name: "Visual · Processing",
  args: { state: { status: "processing" } },
}
export const Error: Story = {
  name: "Visual · Error",
  args: { state: { status: "error" } },
}
