import type { Meta, StoryObj } from "@storybook/react"
import { CommunitySettings } from "@/features/community-settings/CommunitySettings"
import { getApplicationNavigation } from "@/components/ApplicationShell"
import { PrototypeApplicationShell } from "@/prototypes/PrototypeApplicationShell"

const communityContext = {
  id: "photo-club",
  kind: "community" as const,
  label: "Photo Club",
  accentColor: "var(--mantine-color-violet-6)",
}

const meta = {
  title: "Design Prototypes/Community Settings",
  component: CommunitySettings,
  parameters: { layout: "fullscreen" },
  decorators: [
    (Story) => (
      <PrototypeApplicationShell
        currentContext={communityContext}
        contexts={[communityContext]}
        navigationItems={getApplicationNavigation({
          contextKind: communityContext.kind,
          activeSection: "settings",
        })}
        user={{ displayName: "ユーザー" }}
      >
        <Story />
      </PrototypeApplicationShell>
    ),
  ],
} satisfies Meta<typeof CommunitySettings>

export default meta
type Story = StoryObj<typeof meta>

export const Administrator: Story = { args: { role: "admin" } }
export const Member: Story = { args: { role: "member" } }
export const Compact: Story = {
  args: { role: "admin" },
  parameters: { viewport: { defaultViewport: "mobile1" } },
}

export const Members: Story = { args: { role: "admin", section: "members" } }
export const Usage: Story = { args: { role: "member", section: "usage" } }
export const Preferences: Story = { args: { role: "member", section: "preferences" } }
