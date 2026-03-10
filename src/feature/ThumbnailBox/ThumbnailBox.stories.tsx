import type { Meta, StoryObj } from "@storybook/react"
import { ThumbnailBox } from "./ThumbnailBox"

const payload = { src: "sample/h.png", alt: "example.png" }

const meta = {
  title: "features/ThumbnailBox",
  component: ThumbnailBox,
  args: {
    children: (
      <>
        <ThumbnailBox.SelectableCheckbox />
        <ThumbnailBox.RemoveButton />
        <ThumbnailBox.Image {...payload} />
        <ThumbnailBox.Label {...payload} />
      </>
    ),
  },
} satisfies Meta<typeof ThumbnailBox>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const Selected: Story = {
  args: {
    ui: {
      selected: true,
    },
  },
}

export const Selectable: Story = {
  args: {
    ui: {
      selectable: true,
    },
  },
}

export const UnSupported: Story = {
  args: {
    ui: {
      supported: false,
    },
  },
}

export const ValidAccept: Story = {
  args: {
    ui: {
      valid: "accept",
    },
  },
}

export const ValidReject: Story = {
  args: {
    ui: {
      valid: "reject",
    },
  },
}

export const ValidWarning: Story = {
  args: {
    ui: {
      valid: "warning",
      selectable: true,
    },
  },
}
