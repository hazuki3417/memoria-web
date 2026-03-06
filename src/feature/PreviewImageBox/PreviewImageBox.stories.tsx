import type { Meta, StoryObj } from "@storybook/react"
import { PreviewImageBox } from "./PreviewImageBox"

const payload = { src: "sample/h.png", alt: "example.png" }

const meta = {
  title: "features/PreviewImageBox",
  component: PreviewImageBox,
  args: {
    children: (
      <>
        <PreviewImageBox.SelectableCheckbox />
        <PreviewImageBox.RemoveButton />
        <PreviewImageBox.Image {...payload} />
        <PreviewImageBox.Label {...payload} />
      </>
    ),
  },
} satisfies Meta<typeof PreviewImageBox>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
}

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
      selectable: true
    },
  },
}
