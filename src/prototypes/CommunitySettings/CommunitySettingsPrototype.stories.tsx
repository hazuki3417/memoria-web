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

export const Administrator: Story = {
  name: "Administrator",
  tags: ["visual"], args: { role: "admin" } }
export const Member: Story = {
  name: "Member",
  tags: ["visual"], args: { role: "member" } }
export const Compact: Story = {
  name: "Compact",
  tags: ["visual"],
  args: { role: "admin" },
  parameters: { viewport: { defaultViewport: "mobile1" } },
}

export const Members: Story = {
  name: "Members",
  tags: ["visual"], args: { role: "admin", section: "members" } }
export const Usage: Story = {
  name: "Usage",
  tags: ["visual"], args: { role: "member", section: "usage" } }
export const Preferences: Story = {
  name: "Preferences",
  tags: ["visual"],
  args: { role: "member", section: "preferences" },
}
