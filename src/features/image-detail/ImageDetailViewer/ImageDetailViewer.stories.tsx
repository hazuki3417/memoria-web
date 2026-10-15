import type { Meta, StoryObj } from "@storybook/react"
import { useState } from "react"
import type { MediaItem } from "@/features/media-browser/MediaBrowser"
import { useImageDetailEditing } from "../useImageDetailEditing"
import { useImageDetailViewport } from "../useImageDetailViewport"
import { ImageDetailViewer } from "./ImageDetailViewer"

const items: MediaItem[] = [
  { id: "portrait-01", label: "縦長 Media 1", src: "/__dev-assets/media-browser/h-01.png" },
  { id: "landscape-01", label: "横長 Media 1", src: "/__dev-assets/media-browser/w-01.png" },
]

function ViewerStory({ initialId, compact = false }: { initialId: string; compact?: boolean }) {
  const [detail, setDetail] = useState<MediaItem | null>(
    () => items.find((item) => item.id === initialId) ?? null,
  )
  const editing = useImageDetailEditing(detail)
  const viewport = useImageDetailViewport()

  return (
    <ImageDetailViewer
      detail={detail}
      setDetail={setDetail}
      closeImageDetail={() => setDetail(null)}
      stateItems={items}
      compact={compact}
      context="personal"
      downloadMock="available"
      {...editing}
      {...viewport}
    />
  )
}

const meta = {
  title: "Features/Image Detail/ImageDetailViewer",
  component: ViewerStory,
  parameters: { layout: "fullscreen" },
  args: { initialId: "portrait-01", compact: false },
} satisfies Meta<typeof ViewerStory>

export default meta
type Story = StoryObj<typeof meta>

export const Portrait: Story = {}
export const Landscape: Story = { args: { initialId: "landscape-01" } }
export const Compact: Story = { args: { compact: true } }
