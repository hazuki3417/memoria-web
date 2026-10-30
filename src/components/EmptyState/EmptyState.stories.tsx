import type { Meta, StoryObj } from "@storybook/react"
import { Button } from "@mantine/core"
import { IconInbox } from "@tabler/icons-react"
import { fn } from "storybook/test"
import { EmptyState } from "./EmptyState"
const meta = {
  title: "Components/EmptyState",
  component: EmptyState,
  args: {
    title: "データがありません",
    description: "最初のデータを追加してください。",
  },
} satisfies Meta<typeof EmptyState>
export default meta
type Story = StoryObj<typeof meta>
export const Default: Story = { tags: ["visual"] }
export const Inline: Story = { args: { variant: "inline" }, tags: ["visual"] }
export const WithAction: Story = {
  args: {
    icon: <IconInbox size={24} />,
    action: <Button onClick={fn()}>追加する</Button>,
  },
  tags: ["visual"],
}
