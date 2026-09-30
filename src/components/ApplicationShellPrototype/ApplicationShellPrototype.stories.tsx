import type { Meta, StoryObj } from "@storybook/react"
import { ApplicationShellPrototype } from "./ApplicationShellPrototype"

const meta = {
  title: "Design Prototypes/Application Shell",
  component: ApplicationShellPrototype,
  parameters: { layout: "fullscreen" },
} satisfies Meta<typeof ApplicationShellPrototype>

export default meta
type Story = StoryObj<typeof meta>

export const Personal: Story = { args: { initialContext: "personal" } }
export const Community: Story = { args: { initialContext: "community" } }
export const Compact: Story = {
  args: { initialContext: "personal" },
  parameters: { viewport: { defaultViewport: "mobile1" } },
}
