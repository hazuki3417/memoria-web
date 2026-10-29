import type { Meta, StoryObj } from "@storybook/react"
import { ApplicationAccountMenu } from "./ApplicationAccountMenu"

const personal = {
  id: "personal",
  kind: "personal" as const,
  label: "Personal",
  accentColor: "var(--mantine-color-blue-6)",
}

const meta = {
  title: "Features/Application Shell/Account Menu",
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

export const Default: Story = {
  name: "Visual · Default",
  tags: ["visual", "vrt"],
}
export const WithAvatarLabel: Story = {
  name: "Visual · With Avatar Label",
  tags: ["visual", "vrt"],
  args: { user: { displayName: "ユーザー", avatarLabel: "M" } },
}

export const Loading: Story = {
  name: "Visual · Loading",
  tags: ["visual", "vrt"],
  args: {
    user: { displayName: "" },
    profileStatus: "loading",
  },
}

export const Error: Story = {
  name: "Visual · Error",
  tags: ["visual", "vrt"],
  args: {
    user: { displayName: "" },
    profileStatus: "error",
  },
}

export const Community: Story = {
  name: "Visual · Community Context",
  tags: ["visual", "vrt"],
  args: {
    currentContext: {
      id: "family",
      kind: "community",
      label: "家族のアルバム",
      accentColor: "var(--mantine-color-teal-6)",
    },
    user: { displayName: "Memoria User", avatarLabel: "M" },
  },
}
