import type { Meta, StoryObj } from "@storybook/react"
import { SettingsPrototype } from "./SettingsPrototype"

const meta = {
  title: "Design Prototypes/Settings/Account",
  component: SettingsPrototype,
  args: { initialSection: "account" },
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
