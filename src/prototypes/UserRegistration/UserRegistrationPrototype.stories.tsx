import type { Meta, StoryObj } from "@storybook/react"
import { UserRegistrationPrototype } from "./UserRegistrationPrototype"

const meta = {
  title: "Design Prototypes/User Registration",
  component: UserRegistrationPrototype,
  parameters: { layout: "fullscreen" },
} satisfies Meta<typeof UserRegistrationPrototype>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  name: "Visual · Default",
  tags: ["visual"], args: { reviewState: "default" } }
export const NoDisplayName: Story = {
  name: "Visual · No Display Name",
  tags: ["visual"],
  args: { reviewState: "no-display-name" },
}
export const InvalidInput: Story = {
  name: "Visual · Invalid Input",
  tags: ["visual"], args: { reviewState: "invalid" } }
export const Registering: Story = {
  name: "Visual · Registering",
  tags: ["visual"],
  args: { reviewState: "registering" },
}
export const RegistrationFailed: Story = {
  name: "Visual · Registration Failed",
  tags: ["visual"],
  args: { reviewState: "failure" },
}
export const Blocked: Story = {
  name: "Visual · Blocked",
  tags: ["visual"], args: { reviewState: "blocking" } }
export const Registered: Story = {
  name: "Visual · Registered",
  tags: ["visual"], args: { reviewState: "registered" } }
export const Compact: Story = {
  name: "Visual · Compact",
  tags: ["visual"],
  args: { reviewState: "default" },
  parameters: { viewport: { defaultViewport: "mobile1" } },
}
