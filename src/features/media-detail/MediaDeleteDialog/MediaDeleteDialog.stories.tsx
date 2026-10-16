import type { Meta, StoryObj } from "@storybook/react"
import { useState } from "react"
import { Button } from "@mantine/core"
import { MediaDeleteDialog } from "./MediaDeleteDialog"
import type { MediaItem } from "../types"

const media: MediaItem = { id: "portrait-01", label: "縦長 Media 1", src: "/__dev-assets/media-browser/h-01.png" }

function DeleteDialogStory() {
  const [target, setTarget] = useState<MediaItem | null>(media)
  return (
    <>
      <Button onClick={() => setTarget(media)}>削除確認を開く</Button>
      <MediaDeleteDialog target={target} onCancel={() => setTarget(null)} onConfirm={() => setTarget(null)} />
    </>
  )
}

const meta = {
  title: "Features/Media Detail/MediaDeleteDialog",
  component: DeleteDialogStory,
} satisfies Meta<typeof DeleteDialogStory>

export default meta
type Story = StoryObj<typeof meta>
export const Default: Story = {}
