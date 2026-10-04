import type { Meta, StoryObj } from "@storybook/react"
import { SettingsPrototype } from "./SettingsPrototype"

const meta = {
  title: "Design Prototypes/Settings",
  component: SettingsPrototype,
  parameters: { layout: "fullscreen" },
} satisfies Meta<typeof SettingsPrototype>

export default meta
type Story = StoryObj<typeof meta>

export const Profile: Story = { args: { initialSection: "profile" } }
export const Preferences: Story = { args: { initialSection: "preferences" } }
export const Usage: Story = { args: { initialSection: "usage" } }
export const Account: Story = { args: { initialSection: "account" } }

export const CompactProfile: Story = {
  args: { initialSection: "profile" },
  parameters: { viewport: { defaultViewport: "mobile1" } },
}

export const CompactPreferences: Story = {
  args: { initialSection: "preferences" },
  parameters: { viewport: { defaultViewport: "mobile1" } },
}

export const CompactUsage: Story = {
  args: { initialSection: "usage" },
  parameters: { viewport: { defaultViewport: "mobile1" } },
}

export const CompactAccount: Story = {
  args: { initialSection: "account" },
  parameters: { viewport: { defaultViewport: "mobile1" } },
}
