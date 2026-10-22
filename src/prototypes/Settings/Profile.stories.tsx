import type { Meta, StoryObj } from "@storybook/react"
import { SettingsPrototype } from "./SettingsPrototype"

const meta = {
  title: "Design Prototypes/Settings/Profile",
  component: SettingsPrototype,
  args: { initialSection: "profile" },
  parameters: { layout: "fullscreen", applicationShellOwnsPortal: true },
} satisfies Meta<typeof SettingsPrototype>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  name: "Default",
  tags: ["visual"],}

export const Compact: Story = {
  name: "Compact",
  tags: ["visual"],
  parameters: { viewport: { defaultViewport: "mobile1" } },
}

export const Saving: Story = {
  name: "Saving",
  tags: ["visual"],
  args: { initialProfileSaveState: "saving" },
}

export const RetryableFailure: Story = {
  name: "Retryable Failure",
  tags: ["visual"],
  args: { initialProfileSaveState: "retryable-error" },
}

export const BlockingError: Story = {
  name: "Blocking Error",
  tags: ["visual"],
  args: { initialProfileSaveState: "blocked" },
}
