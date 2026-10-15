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

export const BrandOnly: Story = {}
export const Composed: Story = {
  args: {
    leading: <Text size="sm">Navigation</Text>,
    context: <Text size="sm">Context</Text>,
    account: <Text size="sm">Account</Text>,
  },
}
