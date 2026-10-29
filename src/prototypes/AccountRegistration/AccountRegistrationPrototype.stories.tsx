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

