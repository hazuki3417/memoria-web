import type { Meta, StoryObj } from "@storybook/react"
import { UserRegistrationPrototype } from "./UserRegistrationPrototype"

const meta = {
  title: "Design Prototypes/User Registration",
  component: UserRegistrationPrototype,
  parameters: { layout: "fullscreen" },
} satisfies Meta<typeof UserRegistrationPrototype>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = { args: { reviewState: "default" } }
export const NoDisplayName: Story = {
  args: { reviewState: "no-display-name" },
}
export const InvalidInput: Story = { args: { reviewState: "invalid" } }
export const Registering: Story = {
  args: { reviewState: "registering" },
}
export const RegistrationFailed: Story = {
  args: { reviewState: "failure" },
}
export const Blocked: Story = { args: { reviewState: "blocking" } }
export const Registered: Story = { args: { reviewState: "registered" } }
export const Compact: Story = {
  args: { reviewState: "default" },
  parameters: { viewport: { defaultViewport: "mobile1" } },
}
