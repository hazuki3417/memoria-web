import { AppShell, Text } from "@mantine/core"
import type { Meta, StoryObj } from "@storybook/react"
import { ApplicationHeader } from "./ApplicationHeader"

const meta = {
  title: "Components/Application Shell/Header",
  component: ApplicationHeader,
  parameters: { layout: "fullscreen" },
  decorators: [
    (Story) => (
      <AppShell header={{ height: 40 }}>
        <Story />
      </AppShell>
    ),
  ],
  args: { accentColor: "var(--mantine-color-blue-6)" },
} satisfies Meta<typeof ApplicationHeader>

export default meta
type Story = StoryObj<typeof meta>

export const BrandOnly: Story = {
  name: "Visual · Brand Only",
  tags: ["visual"],
}
export const Composed: Story = {
  name: "Visual · Composed",
  tags: ["visual"],
  args: {
    leading: <Text size="sm">Navigation</Text>,
    context: <Text size="sm">Context</Text>,
    account: <Text size="sm">Account</Text>,
  },
}

export const CommunityAccent: Story = {
  name: "Visual · Community Accent",
  tags: ["visual"],
  args: {
    accentColor: "var(--mantine-color-teal-6)",
    leading: <Text size="sm">Navigation</Text>,
    context: <Text size="sm">家族のアルバム</Text>,
    account: <Text size="sm">Account</Text>,
  },
}

export const LongContext: Story = {
  name: "Visual · Long Context",
  tags: ["visual"],
  args: {
    context: <Text size="sm">家族の思い出を長い名前で管理するCommunity</Text>,
  },
}
