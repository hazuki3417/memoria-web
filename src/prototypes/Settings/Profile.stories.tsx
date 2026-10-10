import type { Meta, StoryObj } from "@storybook/react"
import { SettingsPrototype } from "./SettingsPrototype"

const meta = {
  title: "Design Prototypes/Settings/Profile",
  component: SettingsPrototype,
  args: { initialSection: "profile" },
  parameters: { layout: "fullscreen" },
} satisfies Meta<typeof SettingsPrototype>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const Compact: Story = {
  parameters: { viewport: { defaultViewport: "mobile1" } },
}

export const Saving: Story = {
  args: { initialProfileSaveState: "saving" },
}

export const RetryableFailure: Story = {
  args: { initialProfileSaveState: "retryable-error" },
}

export const BlockingError: Story = {
  args: { initialProfileSaveState: "blocked" },
}
