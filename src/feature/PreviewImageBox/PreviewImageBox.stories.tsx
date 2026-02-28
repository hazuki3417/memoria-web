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
  args: {
    ui: {
      selected: false,
      selectable: true,
      supported: true,
    },
  },
}

export const Selected: Story = {
  args: {
    ui: {
      selected: true,
      selectable: true,
      supported: true,
    },
  },
}

export const NonSelectable: Story = {
  args: {
    ui: {
      selected: false,
      selectable: false,
      supported: true,
    },
  },
}

export const UnSupported: Story = {
  args: {
    ui: {
      selected: false,
      selectable: false,
      supported: false,
    },
  },
}

export const ValidAccept: Story = {
  args: {
    ui: {
      selected: false,
      selectable: true,
      supported: true,
      valid: "accept",
    },
  },
}

export const ValidReject: Story = {
  args: {
    ui: {
      selected: false,
      selectable: true,
      supported: true,
      valid: "reject",
    },
  },
}

export const ValidWarning: Story = {
  args: {
    ui: {
      selected: false,
      selectable: true,
      supported: true,
      valid: "warning",
    },
  },
}
