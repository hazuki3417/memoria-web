import type { Meta, StoryObj } from "@storybook/react"
import { AccountDeletionCommunityPrototype } from "./AccountDeletionCommunityPrototype"

const meta = {
  title: "Design Prototypes/Account Deletion Community",
  component: AccountDeletionCommunityPrototype,
  parameters: { layout: "fullscreen" },
} satisfies Meta<typeof AccountDeletionCommunityPrototype>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = { args: { scenario: "default" } }
export const AllKeep: Story = { args: { scenario: "all-keep" } }
export const AllDelete: Story = { args: { scenario: "all-delete" } }
export const NoSuccessor: Story = { args: { scenario: "no-successor" } }
export const LoadFailed: Story = { args: { scenario: "load-failed" } }
export const Compact: Story = {
  args: { scenario: "default" },
  parameters: { viewport: { defaultViewport: "mobile1" } },
}
