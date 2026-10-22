import type { Meta, StoryObj } from "@storybook/react"
import { MediaBrowserPrototype } from "./MediaBrowserPrototype"

const meta = {
  title: "Design Prototypes/MediaBrowserPrototype/MediaDetail",
  component: MediaBrowserPrototype,
  parameters: { layout: "fullscreen", applicationShellOwnsPortal: true },
} satisfies Meta<typeof MediaBrowserPrototype>

export default meta
type Story = StoryObj<typeof meta>

export const Detail: Story = {
  name: "Detail",
  tags: ["visual"],
  args: { initialState: "default", contextKind: "personal" },
  play: async ({ canvasElement }) => {
    const button = canvasElement.querySelector<HTMLButtonElement>(
      'button[aria-label="縦長 Media 1を開く"]',
    )
    button?.click()
  },
}

export const PortraitDetail: Story = {
  name: "Portrait Detail",
  tags: ["visual"],
  args: { initialState: "default", contextKind: "personal" },
  play: async ({ canvasElement }) => {
    canvasElement
      .querySelector<HTMLButtonElement>(
        'button[aria-label="縦長 Media 1を開く"]',
      )
      ?.click()
  },
}

export const LandscapeDetail: Story = {
  name: "Landscape Detail",
  tags: ["visual"],
  args: { initialState: "default", contextKind: "personal" },
  play: async ({ canvasElement }) => {
    canvasElement
      .querySelector<HTMLButtonElement>(
        'button[aria-label="横長 Media 1を開く"]',
      )
      ?.click()
  },
}

export const CommunityDetail: Story = {
  name: "Community Detail",
  tags: ["visual"],
  args: { initialState: "default", contextKind: "community" },
  play: async ({ canvasElement }) => {
    canvasElement
      .querySelector<HTMLButtonElement>(
        'button[aria-label="縦長 Media 1を開く"]',
      )
      ?.click()
  },
}

export const ManyAssociations: Story = {
  name: "Many Associations",
  tags: ["visual"],
  args: {
    initialState: "default",
    contextKind: "personal",
    detailMock: "many",
  },
  play: async ({ canvasElement }) => {
    canvasElement
      .querySelector<HTMLButtonElement>(
        'button[aria-label="縦長 Media 1を開く"]',
      )
      ?.click()
  },
}
export const CompactManyAssociations: Story = {
  name: "Compact Many Associations",
  tags: ["visual"],
  args: {
    initialState: "default",
    contextKind: "personal",
    detailMock: "many",
  },
  parameters: { viewport: { defaultViewport: "mobile1" } },
  play: async ({ canvasElement }) => {
    canvasElement
      .querySelector<HTMLButtonElement>(
        'button[aria-label="縦長 Media 1を開く"]',
      )
      ?.click()
  },
}

export const DownloadUnavailable: Story = {
  name: "Download Unavailable",
  tags: ["visual"],
  args: {
    initialState: "default",
    contextKind: "personal",
    downloadMock: "forbidden",
  },
  play: async ({ canvasElement }) => {
    canvasElement
      .querySelector<HTMLButtonElement>(
        'button[aria-label="縦長 Media 1を開く"]',
      )
      ?.click()
  },
}

export const DownloadProcessing: Story = {
  name: "Download Processing",
  tags: ["visual"],
  args: {
    initialState: "default",
    contextKind: "personal",
    downloadMock: "processing",
  },
  play: async ({ canvasElement }) => {
    canvasElement
      .querySelector<HTMLButtonElement>(
        'button[aria-label="縦長 Media 1を開く"]',
      )
      ?.click()
  },
}

export const CompactDownloadUnavailable: Story = {
  name: "Compact Download Unavailable",
  tags: ["visual"],
  args: {
    initialState: "default",
    contextKind: "personal",
    downloadMock: "forbidden",
  },
  parameters: { viewport: { defaultViewport: "mobile1" } },
  play: async ({ canvasElement }) => {
    canvasElement
      .querySelector<HTMLButtonElement>(
        'button[aria-label="縦長 Media 1を開く"]',
      )
      ?.click()
  },
}
