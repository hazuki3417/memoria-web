import type { Meta, StoryObj } from "@storybook/react"
import { MediaDetailDialog } from "./MediaDetailDialog"

const items = [
  {
    id: "portrait-01",
    label: "縦長 Media 1",
    src: "/__dev-assets/media-browser/h-01.png",
  },
  {
    id: "landscape-01",
    label: "横長 Media 1",
    src: "/__dev-assets/media-browser/w-01.png",
  },
]

const meta = {
  title: "Features/Media Detail/MediaDetailDialog",
  component: MediaDetailDialog,
  parameters: { layout: "fullscreen" },
  args: {
    items,
    initialId: "portrait-01",
    onClose: () => undefined,
    contextKind: "personal",
  },
} satisfies Meta<typeof MediaDetailDialog>

export default meta
type Story = StoryObj<typeof meta>

export const Portrait: Story = {
  name: "Visual · Portrait",
  tags: ["visual"],}
export const Landscape: Story = {
  name: "Visual · Landscape",
  tags: ["visual"], args: { initialId: "landscape-01" } }
export const Community: Story = {
  name: "Visual · Community",
  tags: ["visual"], args: { contextKind: "community" } }
