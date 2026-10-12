import type { Meta, StoryObj } from "@storybook/react"
import { GroupBrowser } from "@/features/group-browser/GroupBrowser"
import { getApplicationNavigation } from "@/components/ApplicationShell"
import { PrototypeApplicationShell } from "@/prototypes/PrototypeApplicationShell"

const personalContext = {
  id: "personal",
  kind: "personal" as const,
  label: "Personal",
  accentColor: "var(--mantine-color-blue-6)",
}

const meta = {
  title: "Design Prototypes/Group Browser",
  component: GroupBrowser,
  parameters: { layout: "fullscreen", nextjs: { appDirectory: true } },
  decorators: [
    (Story) => (
      <PrototypeApplicationShell
        currentContext={personalContext}
        contexts={[personalContext]}
        navigationItems={getApplicationNavigation({
          contextKind: personalContext.kind,
          activeSection: "groups",
        })}
        user={{ displayName: "ユーザー" }}
      >
        <Story />
      </PrototypeApplicationShell>
    ),
  ],
} satisfies Meta<typeof GroupBrowser>

export default meta
type Story = StoryObj<typeof meta>

export const Wide: Story = {}

export const Compact: Story = {
  parameters: { viewport: { defaultViewport: "mobile1" } },
}
