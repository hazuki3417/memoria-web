import type { Meta, StoryObj } from "@storybook/react"
import { ApplicationNavigationTrigger } from "./ApplicationNavigationTrigger"

const meta = {
  title: "Features/Application Shell/Navigation Trigger",
  component: ApplicationNavigationTrigger,
  args: {
    opened: false,
    onToggle: () => undefined,
  },
} satisfies Meta<typeof ApplicationNavigationTrigger>

export default meta
type Story = StoryObj<typeof meta>

export const Closed: Story = {
  name: "Visual · Closed",
  tags: ["visual", "vrt"],
}
export const Opened: Story = {
  name: "Visual · Opened",
  tags: ["visual", "vrt"],
  args: { opened: true },
}
export const Hidden: Story = {
  name: "Visual · Hidden",
  tags: ["visual"],
  args: { hidden: true },
}
