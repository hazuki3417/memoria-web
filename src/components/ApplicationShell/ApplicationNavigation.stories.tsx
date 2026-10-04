import type { Meta, StoryObj } from "@storybook/react"
import { IconLayoutDashboard, IconPhoto, IconUsers } from "@tabler/icons-react"
import { ApplicationNavigation } from "./ApplicationNavigation"

const items = [
  { id: "dashboard", label: "ダッシュボード", icon: IconLayoutDashboard, active: true },
  { id: "media", label: "メディア", icon: IconPhoto },
  { id: "groups", label: "グループ", icon: IconUsers },
]

const meta = {
  title: "Components/Application Shell/Navigation",
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

export const Opened: Story = {}
export const CommunityAccent: Story = { args: { accentColor: "var(--mantine-color-teal-6)" } }
