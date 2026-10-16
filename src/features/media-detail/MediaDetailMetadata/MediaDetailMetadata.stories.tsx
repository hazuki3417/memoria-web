import type { Meta, StoryObj } from "@storybook/react"
import { MediaDetailMetadata } from "./MediaDetailMetadata"

const meta = {
  title: "Features/Media Detail/MediaDetailMetadata",
  component: MediaDetailMetadata,
  args: { downloadMock: "available" },
} satisfies Meta<typeof MediaDetailMetadata>

export default meta
type Story = StoryObj<typeof meta>

export const Available: Story = {}
export const Forbidden: Story = { args: { downloadMock: "forbidden" } }
export const Processing: Story = { args: { downloadMock: "processing" } }
