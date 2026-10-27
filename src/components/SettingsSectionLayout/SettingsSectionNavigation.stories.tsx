import type { Meta, StoryObj } from "@storybook/react"
import { IconSettings, IconUser } from "@tabler/icons-react"
import { fn } from "storybook/test"
import { SettingsSectionNavigation } from "./SettingsSectionNavigation"
const sections = [{ id: "profile", label: "プロフィール", icon: IconUser }, { id: "preferences", label: "環境設定", icon: IconSettings }] as const
const meta = { title: "Components/SettingsSectionNavigation", component: SettingsSectionNavigation, args: { section: "profile", sections, compact: false, ariaLabel: "設定セクション", desktopAriaLabel: "設定ナビゲーション", accentColor: "blue", onSectionChange: fn() } } satisfies Meta<typeof SettingsSectionNavigation>
export default meta
type Story = StoryObj<typeof meta>
export const Desktop: Story = { tags: ["visual"] }
export const Compact: Story = { args: { compact: true }, tags: ["visual"] }
export const SelectedPreferences: Story = { args: { section: "preferences" }, tags: ["visual"] }
