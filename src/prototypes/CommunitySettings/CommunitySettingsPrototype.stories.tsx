import type { Meta, StoryObj } from "@storybook/react"
import { CommunitySettingsView } from "@/features/community-settings/CommunitySettingsView"
import { CommunitySettingsStoryNavigation } from "@/features/community-settings/CommunitySettingsStoryNavigation"
import { getApplicationNavigation } from "@/features/application-shell"
import { PrototypeApplicationShell } from "@/prototypes/PrototypeApplicationShell"

const communityContext = {
  id: "photo-club",
  kind: "community" as const,
  label: "Photo Club",
  accentColor: "var(--mantine-color-violet-6)",
}

const meta = {
  title: "Design Prototypes/Community Settings",
  component: CommunitySettingsView,
  render: (args) => <CommunitySettingsStoryNavigation {...args} />,
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
} satisfies Meta<typeof CommunitySettingsView>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  name: "Default",
  tags: ["visual"],
  args: { role: "admin", onSectionChange: () => undefined, invitationMode: "preview" },
}
