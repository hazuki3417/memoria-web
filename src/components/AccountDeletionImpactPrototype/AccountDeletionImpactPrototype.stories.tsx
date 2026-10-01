import type { Meta, StoryObj } from "@storybook/react"
import { AccountDeletionImpactPrototype } from "./AccountDeletionImpactPrototype"

const meta = {
  title: "Design Prototypes/Account Deletion Impact",
  component: AccountDeletionImpactPrototype,
  parameters: { layout: "fullscreen" },
} satisfies Meta<typeof AccountDeletionImpactPrototype>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = { args: { reviewState: "default" } }
export const NoMedia: Story = { args: { reviewState: "empty" } }
export const LoadFailed: Story = { args: { reviewState: "failure" } }
export const Compact: Story = {
  args: { reviewState: "default" },
  parameters: { viewport: { defaultViewport: "mobile1" } },
}
