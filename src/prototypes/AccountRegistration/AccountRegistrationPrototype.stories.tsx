import type { Meta, StoryObj } from "@storybook/react"
import { AccountRegistrationPrototype } from "./AccountRegistrationPrototype"

const meta = {
  title: "Design Prototypes/Account Registration",
  component: AccountRegistrationPrototype,
  parameters: { layout: "fullscreen" },
} satisfies Meta<typeof AccountRegistrationPrototype>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  name: "Default",
  tags: ["visual"],
  args: { reviewState: "default" },
}
export const NoDisplayName: Story = {
  name: "No Display Name",
  tags: ["visual"],
  args: { reviewState: "no-display-name" },
}
export const InvalidInput: Story = {
  name: "Invalid Input",
  tags: ["visual"],
  args: { reviewState: "invalid" },
}
export const Registering: Story = {
  name: "Registering",
  tags: ["visual"],
  args: { reviewState: "registering" },
}
export const RegistrationFailed: Story = {
  name: "Registration Failed",
  tags: ["visual"],
  args: { reviewState: "failure" },
}
export const Blocked: Story = {
  name: "Blocked",
  tags: ["visual"],
  args: { reviewState: "blocking" },
}
export const Registered: Story = {
  name: "Registered",
  tags: ["visual"],
  args: { reviewState: "registered" },
}
export const Compact: Story = {
  name: "Compact",
  tags: ["visual"],
  args: { reviewState: "default" },
  parameters: { viewport: { defaultViewport: "mobile1" } },
}
