import type { Meta, StoryObj } from "@storybook/react"
import { GroupItem } from "./GroupItem"
const images = [
  "/group-browser/group-media-01.jpg",
  "/group-browser/group-media-02.jpg",
  "/group-browser/group-media-03.jpg",
  "/group-browser/group-media-04.jpg",
  "/group-browser/group-media-05.jpg",
]
const meta = {
  title: "Components/GroupItem",
  component: GroupItem,
  args: { name: "旅行の写真", directMedia: images.slice(0, 4) },
  decorators: [
    (Story) => (
      <div style={{ width: 240 }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof GroupItem>
export default meta
type Story = StoryObj<typeof meta>
export const Default: Story = { tags: ["visual"] }
export const Empty: Story = { args: { directMedia: [] }, tags: ["visual"] }
export const ManyMedia: Story = {
  args: { directMedia: images, directMediaCount: 5 },
  tags: ["visual"],
}
export const Aggregated: Story = {
  args: { directMedia: [], aggregateMedia: images },
  tags: ["visual"],
}
