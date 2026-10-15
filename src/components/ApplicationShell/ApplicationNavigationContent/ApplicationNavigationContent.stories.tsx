import type { Meta, StoryObj } from "@storybook/react"
import { IconLayoutDashboard, IconPhoto, IconUsers } from "@tabler/icons-react"
import { ApplicationNavigationContent } from "./ApplicationNavigationContent"

const items = [
  { id: "dashboard", label: "ダッシュボード", icon: IconLayoutDashboard, active: true },
  { id: "media", label: "メディア", icon: IconPhoto },
  { id: "groups", label: "グループ", icon: IconUsers },
]

const meta = {
  title: "Components/Application Shell/Navigation Content",
  component: ApplicationNavigationContent,
  parameters: { layout: "fullscreen" },
  decorators: [(Story: () => React.ReactNode) => (
    <div style={{ width: 248, height: 360 }}>
      <Story />
    </div>
  )],
  args: {
    items,
    accentColor: "var(--mantine-color-blue-6)",
    onSelect: () => undefined,
  },
} satisfies Meta<typeof ApplicationNavigationContent>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}
export const CommunityAccent: Story = {
  args: { accentColor: "var(--mantine-color-teal-6)" },
}
export const LongLabel: Story = {
  args: {
    items: [
      ...items,
      { id: "long", label: "非常に長いナビゲーション項目のラベルを表示するケース", icon: IconPhoto },
    ],
  },
}
export const ManyItems: Story = {
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
  args: {
    items: [
      ...items,
      { id: "disabled", label: "利用不可", icon: IconPhoto, disabled: true },
    ],
  },
}
