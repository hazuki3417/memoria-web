import type { Meta, StoryObj } from "@storybook/react"
import { useState } from "react"
import type { MediaItem } from "@/features/media-detail/types"
import { useMediaDetailEditing } from "../useMediaDetailEditing"
import { useMediaDetailViewport } from "../useMediaDetailViewport"
import { MediaDetailViewer } from "./MediaDetailViewer"

const items: MediaItem[] = [
  { id: "portrait-01", label: "縦長 Media 1", src: "/__dev-assets/media-browser/h-01.png" },
  { id: "landscape-01", label: "横長 Media 1", src: "/__dev-assets/media-browser/w-01.png" },
]

function ViewerStory({ initialId, compact = false }: { initialId: string; compact?: boolean }) {
  const [detail, setDetail] = useState<MediaItem | null>(
    () => items.find((item) => item.id === initialId) ?? null,
  )
  const editing = useMediaDetailEditing(detail)
  const viewport = useMediaDetailViewport()

  return (
    <MediaDetailViewer
      detail={detail}
      setDetail={setDetail}
      closeMediaDetail={() => setDetail(null)}
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
  title: "Features/Media Detail/MediaDetailViewer",
  component: ViewerStory,
  parameters: { layout: "fullscreen" },
  // ProductionのApplicationShellが提供するPortal先をStorybookでも再現する。
  decorators: [
    (Story) => (
      <>
        <div id="application-modal-root" style={{ position: "relative", zIndex: 400 }} />
        <Story />
      </>
    ),
  ],
  args: { initialId: "portrait-01", compact: false },
} satisfies Meta<typeof ViewerStory>

export default meta
type Story = StoryObj<typeof meta>

export const Portrait: Story = {}
export const Landscape: Story = { args: { initialId: "landscape-01" } }
export const Compact: Story = { args: { compact: true } }
