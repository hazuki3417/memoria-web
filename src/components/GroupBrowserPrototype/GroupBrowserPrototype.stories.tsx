import type { Meta, StoryObj } from "@storybook/react"
import { GroupBrowserPrototype } from "./GroupBrowserPrototype"

const meta = {
  title: "Design Prototypes/Group Browser",
  component: GroupBrowserPrototype,
  parameters: { layout: "fullscreen" },
} satisfies Meta<typeof GroupBrowserPrototype>

export default meta
type Story = StoryObj<typeof meta>

export const Wide: Story = {}
