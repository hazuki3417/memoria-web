import { ApplicationContentScroll } from "@/components/ApplicationShell"
import type { Meta, StoryObj } from "@storybook/react"
import { CommunitySettings } from "@/features/community-settings/CommunitySettings"
import { SettingsUsage } from "@/features/usage"
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
        <ApplicationContentScroll>
        <Story />
              </ApplicationContentScroll>
</PrototypeApplicationShell>
    ),
  ],
} satisfies Meta<typeof CommunitySettings>

export default meta
type Story = StoryObj<typeof meta>

export const Administrator: Story = {
  name: "Administrator",
  tags: ["visual"],
  args: { role: "admin" },
}
export const Member: Story = {
  name: "Member",
  tags: ["visual"],
  args: { role: "member" },
}
export const Compact: Story = {
  name: "Compact",
  tags: ["visual"],
  args: { role: "admin" },
  parameters: { viewport: { defaultViewport: "mobile1" } },
}

export const Members: Story = {
  name: "Members",
  tags: ["visual"],
  args: { role: "admin", section: "members" },
}
const communityUsageFixture = {
  usedBytes: 1_240_000_000,
  limitBytes: 5_000_000_000,
  mediaCount: 1248,
  formatBreakdown: [
    { format: "JPEG" as const, count: 900, sizeBytes: 900_000_000 },
    { format: "PNG" as const, count: 200, sizeBytes: 200_000_000 },
    { format: "WebP" as const, count: 100, sizeBytes: 100_000_000 },
    { format: "HEIC / HEIF" as const, count: 48, sizeBytes: 40_000_000 },
  ],
}

export const Usage: Story = {
  name: "Usage",
  tags: ["visual"],
  args: {
    role: "member",
    section: "usage",
    usageContent: (
      <SettingsUsage
        scope="community"
        usage={communityUsageFixture}
        fileSizeUnit="DECIMAL"
      />
    ),
  },
}
export const Preferences: Story = {
  name: "Preferences",
  tags: ["visual"],
  args: { role: "member", section: "preferences" },
}
