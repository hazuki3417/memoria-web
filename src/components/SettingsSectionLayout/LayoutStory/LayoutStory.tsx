import { Box } from "@mantine/core"
import {
  SettingsSectionLayout,
  SettingsSectionNavigation,
} from "@/components/SettingsSectionLayout"
import { PageStatusBoundary } from "@/components/PageStatusBoundary/PageStatusBoundary"
import { getCommunitySettingsSections } from "@/features/community-settings/communitySettingsSections"
import { PersonalSettingsLayout } from "@/features/personal-settings/PersonalSettingsLayout"

export function LayoutStory({
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
        <PersonalSettingsLayout section="account" onSectionChange={() => undefined}>
          {content}
        </PersonalSettingsLayout>
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
