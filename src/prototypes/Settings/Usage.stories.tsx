import type { Meta, StoryObj } from "@storybook/react"
import { SettingsPrototype } from "./SettingsPrototype"

const meta = {
  title: "Design Prototypes/Settings/Usage",
  component: SettingsPrototype,
  args: { initialSection: "usage" },
  parameters: { layout: "fullscreen" },
} satisfies Meta<typeof SettingsPrototype>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const Compact: Story = {
  parameters: { viewport: { defaultViewport: "mobile1" } },
}
