import type { Meta, StoryObj } from "@storybook/react"
import { MediaUpdatePrototype } from "./MediaUpdatePrototype"

const meta = {
  title: "Prototypes/Media Update",
  component: MediaUpdatePrototype,
  parameters: { layout: "fullscreen" },
} satisfies Meta<typeof MediaUpdatePrototype>

export default meta
type Story = StoryObj<typeof meta>

export const Editing: Story = {}
export const Community: Story = { args: { context: "community" } }
export const Saving: Story = { args: { scenario: "saving" } }
export const Saved: Story = { args: { scenario: "saved" } }
export const PartialFailure: Story = { args: { scenario: "partial-failure" } }
export const LoadFailure: Story = { args: { scenario: "load-failure" } }
export const LeaveConfirmation: Story = { args: { scenario: "leave-confirmation" } }
