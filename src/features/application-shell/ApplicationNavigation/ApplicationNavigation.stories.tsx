import type { Meta, StoryObj } from "@storybook/react"
import { IconLayoutDashboard, IconPhoto, IconUsers } from "@tabler/icons-react"
import { ApplicationNavigation } from "./ApplicationNavigation"

const items = [
  {
    id: "dashboard",
    label: "ダッシュボード",
    icon: IconLayoutDashboard,
    active: true,
  },
  { id: "media", label: "メディア", icon: IconPhoto },
  { id: "groups", label: "グループ", icon: IconUsers },
]

const meta = {
  title: "Features/Application Shell/Navigation",
  component: ApplicationNavigation,
  parameters: { layout: "fullscreen" },
  args: {
    opened: true,
    onClose: () => undefined,
    items,
    accentColor: "var(--mantine-color-blue-6)",
    onSelect: () => undefined,
  },
} satisfies Meta<typeof ApplicationNavigation>

export default meta
type Story = StoryObj<typeof meta>

export const Opened: Story = {
  name: "Visual · Opened",
  tags: ["visual"],
}
export const CommunityAccent: Story = {
  name: "Visual · Community Accent",
  tags: ["visual"],
  args: { accentColor: "var(--mantine-color-teal-6)" },
}

export const Closed: Story = {
  name: "Visual · Closed",
  tags: ["visual"],
  args: { opened: false },
}

export const Empty: Story = {
  name: "Visual · Empty Navigation",
  tags: ["visual"],
  args: { items: [] },
}

export const Disabled: Story = {
  name: "Visual · Disabled Item",
  tags: ["visual"],
  args: {
    items: [
      ...items,
      { id: "restricted", label: "アクセスできません", icon: IconPhoto, disabled: true },
    ],
  },
}
