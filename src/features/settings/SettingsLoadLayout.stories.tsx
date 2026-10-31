import { Box } from "@mantine/core"
import type { Meta, StoryObj } from "@storybook/react"
import { SettingsSectionLayout, SettingsSectionNavigation } from "@/components/SettingsSectionLayout"
import { PageStatusBoundary } from "@/components/PageStatusBoundary/PageStatusBoundary"
import { SettingsLayout } from "./SettingsLayout"
import { getCommunitySettingsSections } from "@/features/community-settings/communitySettingsSections"

function LayoutStory({
  context,
  state,
  compact,
}: {
  context: "personal" | "community"
  state: "loading" | "error" | "ready"
  compact: boolean
}) {
  const content = (
    <PageStatusBoundary state={state} label="設定を読み込み中">
      <Box>設定の読み込みが完了しました。</Box>
    </PageStatusBoundary>
  )
  if (context === "personal") {
    // Render the real Personal settings navigation with a content-only boundary.
    return (
      <Box h={500}>
        <SettingsLayout section="account" onSectionChange={() => undefined}>
          {content}
        </SettingsLayout>
      </Box>
    )
  }
  const sections = getCommunitySettingsSections("demo-community")
  return (
    <Box h={500}>
      <SettingsSectionLayout
        compact={compact}
        navigation={
          <SettingsSectionNavigation
            section="general"
            sections={sections}
            compact={compact}
            ariaLabel="Community設定画面"
            desktopAriaLabel="Community設定"
            accentColor="var(--mantine-color-violet-6)"
            onSectionChange={() => undefined}
          />
        }
      >
        {content}
      </SettingsSectionLayout>
    </Box>
  )
}

const meta = {
  title: "Features/Settings/Loading & Error Layout",
  component: LayoutStory,
  args: { context: "personal", state: "loading", compact: false },
} satisfies Meta<typeof LayoutStory>

export default meta
type Story = StoryObj<typeof meta>

export const PersonalLoading: Story = {
  name: "Visual · Personal / 読み込み中",
  tags: ["visual"],
}
export const PersonalError: Story = {
  name: "Visual · Personal / 取得失敗",
  tags: ["visual", "vrt"],
  args: { state: "error" },
}
export const CommunityLoading: Story = {
  name: "Visual · Community / 読み込み中",
  tags: ["visual"],
  args: { context: "community" },
}
export const CommunityError: Story = {
  name: "Visual · Community / 取得失敗",
  tags: ["visual", "vrt"],
  args: { context: "community", state: "error" },
}
export const CommunityCompactLoading: Story = {
  name: "Visual · Community Mobile / 読み込み中",
  tags: ["visual"],
  args: { context: "community", compact: true },
}
export const CommunityCompactError: Story = {
  name: "Visual · Community Mobile / 取得失敗",
  tags: ["visual", "vrt"],
  args: { context: "community", compact: true, state: "error" },
}
