import type { Meta, StoryObj } from "@storybook/react"
import { MediaUploadPrototype } from "./MediaUploadPrototype"

const meta = {
  title: "Design Prototypes/Media Upload",
  component: MediaUploadPrototype,
  parameters: { layout: "fullscreen", applicationShellOwnsPortal: true },
} satisfies Meta<typeof MediaUploadPrototype>

export default meta
type Story = StoryObj<typeof meta>

export const Empty: Story = {
  name: "Empty",
  tags: ["visual"], args: { scenario: "empty", context: "personal" } }
export const Ready: Story = {
  name: "Ready",
  tags: ["visual"], args: { scenario: "ready", context: "personal" } }
export const ValidationErrors: Story = {
  name: "Validation Errors",
  tags: ["visual"],
  args: { scenario: "validation-errors", context: "personal" },
}
export const Uploading: Story = {
  name: "Uploading",
  tags: ["visual"],
  args: { scenario: "uploading", context: "personal" },
}
export const PartialFailure: Story = {
  name: "Partial Failure",
  tags: ["visual"],
  args: { scenario: "partial-failure", context: "personal" },
}
export const AllFailed: Story = {
  name: "All Failed",
  tags: ["visual"],
  args: { scenario: "all-failed", context: "personal" },
}
export const NonRetryableFailure: Story = {
  name: "Non Retryable Failure",
  tags: ["visual"],
  args: { scenario: "non-retryable-failure", context: "personal" },
}
export const ResultUnknown: Story = {
  name: "Result Unknown",
  tags: ["visual"],
  args: { scenario: "result-unknown", context: "personal" },
}
export const Processing: Story = {
  name: "Processing",
  tags: ["visual"],
  args: { scenario: "processing", context: "personal" },
}
export const Completed: Story = {
  name: "Completed",
  tags: ["visual"],
  args: { scenario: "completed", context: "personal" },
}
export const ProcessingFailure: Story = {
  name: "Processing Failure",
  tags: ["visual"],
  args: { scenario: "processing-failure", context: "personal" },
}
export const LeaveConfirmation: Story = {
  name: "Leave Confirmation",
  tags: ["visual"],
  args: { scenario: "leave-confirmation", context: "personal" },
}
export const LeaveUploadingConfirmation: Story = {
  name: "Leave Uploading Confirmation",
  tags: ["visual"],
  args: { scenario: "leave-uploading-confirmation", context: "personal" },
}
export const Community: Story = {
  name: "Community",
  tags: ["visual"],
  args: { scenario: "ready", context: "community" },
}
export const Compact: Story = {
  name: "Compact",
  tags: ["visual"],
  args: { scenario: "validation-errors", context: "personal" },
  parameters: { viewport: { defaultViewport: "mobile1" } },
}
