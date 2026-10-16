import type { Meta, StoryObj } from "@storybook/react"
import { MediaBrowserPrototype } from "./MediaBrowserPrototype"

const meta = {
  title: "Design Prototypes/Media Detail",
  component: MediaBrowserPrototype,
  parameters: { layout: "fullscreen" },
} satisfies Meta<typeof MediaBrowserPrototype>

export default meta
type Story = StoryObj<typeof meta>

export const Detail: Story = {
  args: { initialState: "default", contextKind: "personal" },
  play: async ({ canvasElement }) => {
    const button = canvasElement.querySelector<HTMLButtonElement>(
      'button[aria-label="縦長 Media 1を開く"]',
    )
    button?.click()
  },
}

export const PortraitDetail: Story = {
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
