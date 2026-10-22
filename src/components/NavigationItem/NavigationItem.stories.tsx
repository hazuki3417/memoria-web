import type { Meta, StoryObj } from "@storybook/react"
import { IconPhoto } from "@tabler/icons-react"
import { NavigationItem } from "./NavigationItem"

const meta = {
  title: "Components/Navigation Item",
  component: NavigationItem,
  args: {
    label: "Media",
    icon: IconPhoto,
  },
} satisfies Meta<typeof NavigationItem>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  name: "Visual · Default",
  tags: ["visual"],}

export const Active: Story = {
  name: "Visual · Active",
  tags: ["visual"],
  args: {
    active: true,
    accentColor: "var(--mantine-color-blue-6)",
  },
}

export const Disabled: Story = {
  name: "Visual · Disabled",
  tags: ["visual"],
  args: {
    disabled: true,
  },
}

export const CommunityAccent: Story = {
  name: "Visual · Community Accent",
  tags: ["visual"],
  args: {
    active: true,
    accentColor: "var(--mantine-color-violet-6)",
  },
}
