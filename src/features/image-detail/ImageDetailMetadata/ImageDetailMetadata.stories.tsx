import type { Meta, StoryObj } from "@storybook/react"
import { ImageDetailMetadata } from "./ImageDetailMetadata"

const meta = {
  title: "Features/Image Detail/ImageDetailMetadata",
  component: ImageDetailMetadata,
  args: { downloadMock: "available" },
} satisfies Meta<typeof ImageDetailMetadata>

export default meta
type Story = StoryObj<typeof meta>

export const Available: Story = {}
export const Forbidden: Story = { args: { downloadMock: "forbidden" } }
export const Processing: Story = { args: { downloadMock: "processing" } }
