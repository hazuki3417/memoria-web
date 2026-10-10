import type { Meta, StoryObj } from "@storybook/react"
import { SettingsPrototype } from "./SettingsPrototype"

const meta = {
  title: "Design Prototypes/Settings/Account",
  component: SettingsPrototype,
  args: { initialSection: "account" },
  parameters: { layout: "fullscreen" },
} satisfies Meta<typeof SettingsPrototype>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const Compact: Story = {
  parameters: { viewport: { defaultViewport: "mobile1" } },
}
