import type { Meta, StoryObj } from "@storybook/react"
import type { ReactNode } from "react"
import { IconLayoutDashboard, IconPhoto, IconUsers } from "@tabler/icons-react"
import { ApplicationNavigationContent } from "./ApplicationNavigationContent"

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
  title: "Features/Application Shell/Navigation Content",
  component: ApplicationNavigationContent,
  parameters: { layout: "fullscreen" },
  decorators: [
    (Story: () => ReactNode) => (
      <div style={{ width: 248, height: 360 }}>
        <Story />
      </div>
    ),
  ],
  args: {
    items,
    accentColor: "var(--mantine-color-blue-6)",
    onSelect: () => undefined,
  },
} satisfies Meta<typeof ApplicationNavigationContent>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  name: "Visual · Default",
  tags: ["visual"],
}
export const CommunityAccent: Story = {
  name: "Visual · Community Accent",
  tags: ["visual"],
  args: { accentColor: "var(--mantine-color-teal-6)" },
}
export const LongLabel: Story = {
  name: "Visual · Long Label",
  tags: ["visual"],
  args: {
    items: [
      ...items,
      {
        id: "long",
        label: "非常に長いナビゲーション項目のラベルを表示するケース",
        icon: IconPhoto,
      },
    ],
  },
}
export const ManyItems: Story = {
  name: "Visual · Many Items",
  tags: ["visual"],
  args: {
    items: Array.from({ length: 20 }, (_, index) => ({
      id: `item-${index}`,
      label: `項目 ${index + 1}`,
      icon: IconPhoto,
      active: index === 0,
      disabled: index === 19,
    })),
  },
}
export const Disabled: Story = {
  name: "Visual · Disabled",
  tags: ["visual"],
  args: {
    items: [
      ...items,
      { id: "disabled", label: "利用不可", icon: IconPhoto, disabled: true },
    ],
  },
}

export const NoItems: Story = {
  name: "Visual · No Items",
  tags: ["visual"],
  args: { items: [] },
}
