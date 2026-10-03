import type { Meta, StoryObj } from "@storybook/react"
import { MediaUploadPrototype } from "./MediaUploadPrototype"

const meta = {
  title: "Design Prototypes/Media Upload",
  component: MediaUploadPrototype,
  parameters: { layout: "fullscreen" },
} satisfies Meta<typeof MediaUploadPrototype>

export default meta
type Story = StoryObj<typeof meta>

export const Empty: Story = { args: { scenario: "empty", context: "personal" } }
export const Ready: Story = { args: { scenario: "ready", context: "personal" } }
export const ValidationErrors: Story = { args: { scenario: "validation-errors", context: "personal" } }
export const Uploading: Story = { args: { scenario: "uploading", context: "personal" } }
export const PartialFailure: Story = { args: { scenario: "partial-failure", context: "personal" } }
export const Processing: Story = { args: { scenario: "processing", context: "personal" } }
export const Completed: Story = { args: { scenario: "completed", context: "personal" } }
export const ProcessingFailure: Story = { args: { scenario: "processing-failure", context: "personal" } }
export const Community: Story = { args: { scenario: "ready", context: "community" } }
export const Compact: Story = {
  args: { scenario: "validation-errors", context: "personal" },
  parameters: { viewport: { defaultViewport: "mobile1" } },
}
