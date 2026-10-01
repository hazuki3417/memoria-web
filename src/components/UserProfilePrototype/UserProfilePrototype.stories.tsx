import type { Meta, StoryObj } from "@storybook/react"
import { UserProfilePrototype } from "./UserProfilePrototype"

const meta = {
  title: "Design Prototypes/User Profile",
  component: UserProfilePrototype,
  parameters: { layout: "fullscreen" },
} satisfies Meta<typeof UserProfilePrototype>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = { args: { reviewState: "default" } }
export const UnsavedChanges: Story = { args: { reviewState: "unsaved" } }
export const InvalidInput: Story = { args: { reviewState: "invalid" } }
export const Saving: Story = { args: { reviewState: "saving" } }
export const Saved: Story = { args: { reviewState: "success" } }
export const SaveFailed: Story = { args: { reviewState: "failure" } }
export const Blocked: Story = { args: { reviewState: "blocking" } }
export const Compact: Story = {
  args: { reviewState: "default" },
  parameters: { viewport: { defaultViewport: "mobile1" } },
}
