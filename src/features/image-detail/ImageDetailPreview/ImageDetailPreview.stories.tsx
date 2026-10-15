import type { Meta, StoryObj } from "@storybook/react"
import { ImageDetailPreview } from "./ImageDetailPreview"

const first = { id: "portrait-01", label: "縦長 Media", src: "/__dev-assets/media-browser/h-01.png" }
const second = { id: "landscape-01", label: "横長 Media", src: "/__dev-assets/media-browser/w-01.png" }
const items = [first, second]

const meta = {
  title: "Features/Image Detail/ImageDetailPreview",
  component: ImageDetailPreview,
  parameters: { layout: "fullscreen" },
  args: {
    detail: first,
    stateItems: items,
    prev: null,
    next: second,
    closeImageDetail: () => undefined,
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
} satisfies Meta<typeof ImageDetailPreview>

export default meta
type Story = StoryObj<typeof meta>

export const First: Story = {}
export const Last: Story = { args: { detail: second, prev: first, next: null } }
export const Compact: Story = { args: { compact: true } }
export const Zoomed: Story = { args: { detailZoom: 200 } }
