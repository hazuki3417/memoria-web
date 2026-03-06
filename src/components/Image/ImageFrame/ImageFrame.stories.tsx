import type { Meta, StoryObj } from "@storybook/react"
import { ImageTile } from "../ImageTile"
import { ImageFrame } from "./ImageFrame"

const meta = {
  title: "Image/ImageFrame",
  component: ImageFrame,
} satisfies Meta<typeof ImageFrame>

export default meta
type Story = StoryObj<typeof meta>

const children = <ImageTile src="sample/h.png" alt="example" />

export const Default: Story = {
  args: {
    children,
    ui: {},
  },
}

export const Selected: Story = {
  args: {
    children,
    ui: {
      selected: true,
    },
  },
}

export const Selectable: Story = {
  args: {
    children,
    ui: {
      selectable: true,
    },
  },
}

export const ValidAccept: Story = {
  args: {
    children,
    ui: {
      valid: "accept",
    },
  },
}

export const ValidReject: Story = {
  args: {
    children,
    ui: {
      valid: "reject",
    },
  },
}

export const ValidWarning: Story = {
  args: {
    children,
    ui: {
      valid: "warning",
    },
  },
}
