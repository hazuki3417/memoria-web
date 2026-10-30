import type { Meta, StoryObj } from "@storybook/react"
import { ApplicationShellPrototype } from "./ApplicationShellPrototype"

const meta = {
  title: "Design Prototypes/Application Shell",
  component: ApplicationShellPrototype,
  parameters: { layout: "fullscreen" },
} satisfies Meta<typeof ApplicationShellPrototype>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  name: "Default",
  tags: ["visual"],
  args: { initialContext: "personal" },
}
