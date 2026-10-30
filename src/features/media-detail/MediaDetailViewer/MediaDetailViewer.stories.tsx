import type { Meta, StoryObj } from "@storybook/react"
import { useState } from "react"
import type { MediaItem } from "@/features/media-detail/types"
import { useMediaDetailEditing } from "../useMediaDetailEditing"
import { useMediaDetailViewport } from "../useMediaDetailViewport"
import { MediaDetailViewer } from "./MediaDetailViewer"

const items: MediaItem[] = [
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

function ViewerStory({
  initialId,
  compact = false,
  idOnly = false,
  unavailable = false,
}: {
  initialId: string
  compact?: boolean
  idOnly?: boolean
  unavailable?: boolean
}) {
  const [detail, setDetail] = useState<MediaItem | null>(
    () => items.find((item) => item.id === initialId) ?? null,
  )
  const editing = useMediaDetailEditing(detail)
  const viewport = useMediaDetailViewport()

  return (
    <MediaDetailViewer
      detail={idOnly ? null : detail}
      selectedId={idOnly ? initialId : undefined}
      read={idOnly ? {
        detail: unavailable ? { kind: "unavailable" } : { kind: "loading" },
        preview: unavailable ? { kind: "unavailable" } : { kind: "detail-loading" },
        groups: { kind: "pending" },
        tags: { kind: "pending" },
      } : undefined}
      setDetail={setDetail}
      closeMediaDetail={() => setDetail(null)}
      onRequestDelete={() => undefined}
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
  args: { initialId: "portrait-01", compact: false, idOnly: false, unavailable: false },
} satisfies Meta<typeof ViewerStory>

export default meta
type Story = StoryObj<typeof meta>

export const Portrait: Story = {
  name: "Visual · Portrait",
  tags: ["visual"],
}
export const Landscape: Story = {
  name: "Visual · Landscape",
  tags: ["visual"],
  args: { initialId: "landscape-01" },
}
export const Compact: Story = {
  name: "Visual · Compact",
  tags: ["visual"],
  args: { compact: true },
}

export const DirectUrlLoading: Story = {
  name: "Visual · Direct URL / ID-only Loading",
  tags: ["visual"],
  args: { initialId: "remote-id", idOnly: true },
}

export const DirectUrlUnavailable: Story = {
  name: "Visual · Direct URL / ID-only Unavailable",
  tags: ["visual"],
  args: { initialId: "missing-id", idOnly: true, unavailable: true },
}
