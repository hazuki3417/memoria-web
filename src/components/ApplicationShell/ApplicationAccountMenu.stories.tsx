import type { Meta, StoryObj } from "@storybook/react"
import { ApplicationAccountMenu } from "./ApplicationAccountMenu"

const personal = { id: "personal", kind: "personal" as const, label: "Personal", accentColor: "var(--mantine-color-blue-6)" }

const meta = {
  title: "Components/Application Shell/Account Menu",
  component: ApplicationAccountMenu,
  args: {
    user: { displayName: "ユーザー" },
    currentContext: personal,
    onOpenSettings: () => undefined,
    onLogout: () => undefined,
  },
} satisfies Meta<typeof ApplicationAccountMenu>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}
export const WithAvatarLabel: Story = { args: { user: { displayName: "ユーザー", avatarLabel: "M" } } }
