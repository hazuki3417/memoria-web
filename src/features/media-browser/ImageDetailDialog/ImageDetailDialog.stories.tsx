import type { Meta, StoryObj } from "@storybook/react"
import { ImageDetailDialog } from "./ImageDetailDialog"

const items = [
  { id: "portrait-01", label: "縦長 Media 1", src: "/__dev-assets/media-browser/h-01.png" },
  { id: "landscape-01", label: "横長 Media 1", src: "/__dev-assets/media-browser/w-01.png" },
]

const meta = {
  title: "Features/Image Detail/ImageDetailDialog (移行中)",
  component: ImageDetailDialog,
  parameters: { layout: "fullscreen" },
  args: {
    items,
    initialId: "portrait-01",
    onClose: () => undefined,
    contextKind: "personal",
  },
} satisfies Meta<typeof ImageDetailDialog>

export default meta
type Story = StoryObj<typeof meta>

export const Portrait: Story = {}
export const Landscape: Story = { args: { initialId: "landscape-01" } }
export const Community: Story = { args: { contextKind: "community" } }
