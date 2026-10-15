import type { Meta, StoryObj } from "@storybook/react"
import { ApplicationContextSwitcher } from "./ApplicationContextSwitcher"

const personal = {
  id: "personal",
  kind: "personal" as const,
  label: "Personal",
  accentColor: "var(--mantine-color-blue-6)",
}
const family = {
  id: "family",
  kind: "community" as const,
  label: "家族のアルバム",
  accentColor: "var(--mantine-color-teal-6)",
}

const meta = {
  title: "Components/Application Shell/Context Switcher",
  component: ApplicationContextSwitcher,
  args: {
    currentContext: personal,
    contexts: [personal, family],
    onSelect: () => undefined,
    onCreateCommunity: () => undefined,
  },
} satisfies Meta<typeof ApplicationContextSwitcher>

export default meta
type Story = StoryObj<typeof meta>

export const Personal: Story = {}
export const Community: Story = { args: { currentContext: family } }
export const WithoutCreateCommunity: Story = {
  args: { onCreateCommunity: undefined },
}
