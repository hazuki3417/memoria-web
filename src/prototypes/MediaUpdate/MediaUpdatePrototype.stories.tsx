import type { Meta, StoryObj } from "@storybook/react"
import { MediaUpdatePrototype } from "./MediaUpdatePrototype"

const meta = {
  title: "Design Prototypes/Media Update",
  component: MediaUpdatePrototype,
  parameters: { layout: "fullscreen", applicationShellOwnsPortal: true },
} satisfies Meta<typeof MediaUpdatePrototype>

export default meta
type Story = StoryObj<typeof meta>

export const Editing: Story = {
  name: "Visual · Editing",
  tags: ["visual"],}
export const Community: Story = {
  name: "Visual · Community",
  tags: ["visual"], args: { context: "community" } }
export const Saving: Story = {
  name: "Visual · Saving",
  tags: ["visual"], args: { scenario: "saving" } }
export const Saved: Story = {
  name: "Visual · Saved",
  tags: ["visual"], args: { scenario: "saved" } }
export const PartialFailure: Story = {
  name: "Visual · Partial Failure",
  tags: ["visual"], args: { scenario: "partial-failure" } }
export const LoadFailure: Story = {
  name: "Visual · Load Failure",
  tags: ["visual"], args: { scenario: "load-failure" } }
export const LeaveConfirmation: Story = {
  name: "Visual · Leave Confirmation",
  tags: ["visual"],
  args: { scenario: "leave-confirmation" },
}
