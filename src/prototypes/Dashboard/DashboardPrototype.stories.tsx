import type { Meta, StoryObj } from "@storybook/react"
import { DashboardPrototype } from "./DashboardPrototype"

const meta = {
  title: "Design Prototypes/Dashboard",
  component: DashboardPrototype,
  parameters: { layout: "fullscreen", applicationShellOwnsPortal: true },
} satisfies Meta<typeof DashboardPrototype>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  name: "Default",
  tags: ["visual"],
  args: { initialContext: "personal", initialState: "default" },
}

