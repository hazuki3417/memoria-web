import type { Meta, StoryObj } from "@storybook/react"
import { DashboardPrototype } from "./DashboardPrototype"

const meta = {
  title: "Design Prototypes/Dashboard",
  component: DashboardPrototype,
  parameters: { layout: "fullscreen" },
} satisfies Meta<typeof DashboardPrototype>

export default meta
type Story = StoryObj<typeof meta>

export const Personal: Story = { args: { initialContext: "personal", initialState: "default" } }
export const Community: Story = { args: { initialContext: "community", initialState: "default" } }
export const Empty: Story = { args: { initialContext: "personal", initialState: "empty" } }
export const CommunityEmpty: Story = { args: { initialContext: "community", initialState: "empty" } }
export const Compact: Story = {
  args: { initialContext: "personal", initialState: "default" },
  parameters: { viewport: { defaultViewport: "mobile1" } },
}
export const CompactEmpty: Story = {
  args: { initialContext: "personal", initialState: "empty" },
  parameters: { viewport: { defaultViewport: "mobile1" } },
}
export const Medium: Story = {
  args: { initialContext: "personal", initialState: "default" },
  parameters: { viewport: { defaultViewport: "tablet" } },
}
