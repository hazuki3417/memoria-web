import type { Meta, StoryObj } from "@storybook/react"
import { ApplicationShellPrototype } from "./ApplicationShellPrototype"

const meta = {
  title: "Design Prototypes/Application Shell",
  component: ApplicationShellPrototype,
  parameters: { layout: "fullscreen", applicationShellOwnsPortal: true },
} satisfies Meta<typeof ApplicationShellPrototype>

export default meta
type Story = StoryObj<typeof meta>

export const Personal: Story = {
  name: "Personal",
  tags: ["visual"],
  args: { initialContext: "personal" },
}
export const Community: Story = {
  name: "Community",
  tags: ["visual"],
  args: { initialContext: "community" },
}
export const Compact: Story = {
  name: "Compact",
  tags: ["visual"],
  args: { initialContext: "personal" },
  parameters: { viewport: { defaultViewport: "mobile1" } },
}
