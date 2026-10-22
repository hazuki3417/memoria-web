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
  name: "Visual · Empty",
  tags: ["visual"], args: { scenario: "empty", context: "personal" } }
export const Ready: Story = {
  name: "Visual · Ready",
  tags: ["visual"], args: { scenario: "ready", context: "personal" } }
export const ValidationErrors: Story = {
  name: "Visual · Validation Errors",
  tags: ["visual"],
  args: { scenario: "validation-errors", context: "personal" },
}
export const Uploading: Story = {
  name: "Visual · Uploading",
  tags: ["visual"],
  args: { scenario: "uploading", context: "personal" },
}
export const PartialFailure: Story = {
  name: "Visual · Partial Failure",
  tags: ["visual"],
  args: { scenario: "partial-failure", context: "personal" },
}
export const AllFailed: Story = {
  name: "Visual · All Failed",
  tags: ["visual"],
  args: { scenario: "all-failed", context: "personal" },
}
export const NonRetryableFailure: Story = {
  name: "Visual · Non Retryable Failure",
  tags: ["visual"],
  args: { scenario: "non-retryable-failure", context: "personal" },
}
export const ResultUnknown: Story = {
  name: "Visual · Result Unknown",
  tags: ["visual"],
  args: { scenario: "result-unknown", context: "personal" },
}
export const Processing: Story = {
  name: "Visual · Processing",
  tags: ["visual"],
  args: { scenario: "processing", context: "personal" },
}
export const Completed: Story = {
  name: "Visual · Completed",
  tags: ["visual"],
  args: { scenario: "completed", context: "personal" },
}
export const ProcessingFailure: Story = {
  name: "Visual · Processing Failure",
  tags: ["visual"],
  args: { scenario: "processing-failure", context: "personal" },
}
export const LeaveConfirmation: Story = {
  name: "Visual · Leave Confirmation",
  tags: ["visual"],
  args: { scenario: "leave-confirmation", context: "personal" },
}
export const LeaveUploadingConfirmation: Story = {
  name: "Visual · Leave Uploading Confirmation",
  tags: ["visual"],
  args: { scenario: "leave-uploading-confirmation", context: "personal" },
}
export const Community: Story = {
  name: "Visual · Community",
  tags: ["visual"],
  args: { scenario: "ready", context: "community" },
}
export const Compact: Story = {
  name: "Visual · Compact",
  tags: ["visual"],
  args: { scenario: "validation-errors", context: "personal" },
  parameters: { viewport: { defaultViewport: "mobile1" } },
}
