import type { Meta, StoryObj } from "@storybook/react"
import { SettingsPrototype } from "./SettingsPrototype"

const meta = {
  title: "Design Prototypes/Settings/Usage",
  component: SettingsPrototype,
  args: { initialSection: "usage" },
  parameters: { layout: "fullscreen", applicationShellOwnsPortal: true },
} satisfies Meta<typeof SettingsPrototype>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  name: "Default",
  tags: ["visual"],
}

export const Compact: Story = {
  name: "Compact",
  tags: ["visual"],
  parameters: { viewport: { defaultViewport: "mobile1" } },
}

export const Loading: Story = {
  name: "Loading",
  args: { initialUsageScenario: "loading" },
  tags: ["visual"],
}

export const Error: Story = {
  name: "Error / Retry",
  args: { initialUsageScenario: "error" },
  tags: ["visual"],
}

export const ErrorCompact: Story = {
  name: "Error / Retry（Compact）",
  args: { initialUsageScenario: "error" },
  tags: ["visual"],
  parameters: { viewport: { defaultViewport: "mobile1" } },
}

export const Zero: Story = {
  name: "使用量0",
  args: { initialUsageScenario: "zero" },
  tags: ["visual"],
}

export const LimitReached: Story = {
  name: "上限到達",
  args: { initialUsageScenario: "limit-reached" },
  tags: ["visual"],
}
