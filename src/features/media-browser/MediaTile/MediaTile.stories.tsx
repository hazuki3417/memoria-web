import type { ComponentProps } from "react"
import type { Meta, StoryObj } from "@storybook/react"
import { fn } from "storybook/test"
import { MediaTile } from "./MediaTile"

type Item = ComponentProps<typeof MediaTile>["item"]
const ready = {
  id: "media-1",
  label: "旅行の写真",
  src: "/media-browser/h-01.png",
} as Item

const meta = {
  title: "Features/Media Browser/MediaTile",
  component: MediaTile,
  args: { item: ready, selecting: false, selected: false, onClick: fn() },
  decorators: [
    (Story) => (
      <div style={{ width: 168 }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof MediaTile>
export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = { tags: ["visual"] }
export const Selectable: Story = { args: { selecting: true }, tags: ["visual"] }
export const Selected: Story = {
  args: { selecting: true, selected: true },
  tags: ["visual"],
}
export const Processing: Story = {
  args: { item: { ...ready, processing: true } },
  tags: ["visual"],
}
export const Failed: Story = {
  args: { item: { ...ready, failed: true } },
  tags: ["visual"],
}
export const NoPreview: Story = {
  args: { item: { ...ready, src: "" } },
  tags: ["visual"],
}
