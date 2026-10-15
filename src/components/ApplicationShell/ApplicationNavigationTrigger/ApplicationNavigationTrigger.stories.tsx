import type { Meta, StoryObj } from "@storybook/react"
import { ApplicationNavigationTrigger } from "./ApplicationNavigationTrigger"

const meta = {
  title: "Components/Application Shell/Navigation Trigger",
  component: ApplicationNavigationTrigger,
  args: {
    opened: false,
    onToggle: () => undefined,
  },
} satisfies Meta<typeof ApplicationNavigationTrigger>

export default meta
type Story = StoryObj<typeof meta>

export const Closed: Story = {}
export const Opened: Story = { args: { opened: true } }
export const Hidden: Story = { args: { hidden: true } }
