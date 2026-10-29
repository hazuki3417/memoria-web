import type { Meta, StoryObj } from "@storybook/react"
import { MediaDetailPreview } from "./MediaDetailPreview"

const first = {
  id: "portrait-01",
  label: "縦長 Media",
  src: "/__dev-assets/media-browser/h-01.png",
}
const second = {
  id: "landscape-01",
  label: "横長 Media",
  src: "/__dev-assets/media-browser/w-01.png",
}
const items = [first, second]

const meta = {
  title: "Features/Media Detail/MediaDetailPreview",
  component: MediaDetailPreview,
  parameters: { layout: "fullscreen" },
  args: {
    detail: first,
    stateItems: items,
    prev: null,
    next: second,
    closeMediaDetail: () => undefined,
    setDetail: () => undefined,
    prepareNavigation: () => undefined,
    compact: false,
    detailZoom: 100,
    setDetailZoom: () => undefined,
    detailRotate: 0,
    setDetailRotate: () => undefined,
    detailRotateAnimated: true,
    setDetailRotateAnimated: () => undefined,
    detailDirection: 1,
    detailInfoOpened: true,
    setDetailInfoOpened: () => undefined,
  },
} satisfies Meta<typeof MediaDetailPreview>

export default meta
type Story = StoryObj<typeof meta>

export const First: Story = {
  name: "Visual · First",
  tags: ["visual"],
}
export const Last: Story = {
  name: "Visual · Last",
  tags: ["visual"],
  args: { detail: second, prev: first, next: null },
}
export const Compact: Story = {
  name: "Visual · Compact",
  tags: ["visual"],
  args: { compact: true },
}
export const Zoomed: Story = {
  name: "Visual · Zoomed",
  tags: ["visual"],
  args: { detailZoom: 200 },
}

export const DetailLoading: Story = {
  name: "Visual · Detail Loading",
  tags: ["visual"],
  args: { readState: { kind: "detail-loading" } },
}
export const Processing: Story = {
  name: "Visual · Processing",
  tags: ["visual"],
  args: { readState: { kind: "processing" } },
}
export const DeliveryError: Story = {
  name: "Visual · Image Error",
  tags: ["visual"],
  args: { readState: { kind: "delivery-error", retryable: true }, onRetryImage: () => undefined },
}
