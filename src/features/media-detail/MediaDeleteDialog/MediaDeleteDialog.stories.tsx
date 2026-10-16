import type { Meta, StoryObj } from "@storybook/react"
import { MediaDeleteDialog } from "./MediaDeleteDialog"
import type { MediaItem } from "../types"

const media: MediaItem = {
  id: "portrait-01",
  label: "縦長 Media 1",
  src: "/__dev-assets/media-browser/h-01.png",
}

const meta = {
  title: "Features/Media Detail/MediaDeleteDialog",
  component: MediaDeleteDialog,
  args: {
    target: media,
    onCancel: () => undefined,
    onConfirm: () => undefined,
  },
} satisfies Meta<typeof MediaDeleteDialog>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}
