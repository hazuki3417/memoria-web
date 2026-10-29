import type { Meta, StoryObj } from "@storybook/react"
import { AccountDeletionImpactPrototype } from "./AccountDeletionImpactPrototype"

const meta = {
  title: "Design Prototypes/Account Deletion",
  component: AccountDeletionImpactPrototype,
  parameters: { layout: "fullscreen", applicationShellOwnsPortal: true },
} satisfies Meta<typeof AccountDeletionImpactPrototype>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  name: "Default",
  tags: ["visual"],
  args: { reviewState: "default", communityScenario: "mixed-memberships" },
}

