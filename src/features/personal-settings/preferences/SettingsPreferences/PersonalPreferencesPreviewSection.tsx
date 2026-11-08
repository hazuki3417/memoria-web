"use client"

import { Box, Stack, Switch } from "@mantine/core"
import { SectionHeader } from "@/components/SectionHeader"
import { SettingRow } from "@/components/SettingRow"
import type { useUserPreferences } from "../useUserPreferences"
type PreferencesModel = ReturnType<typeof useUserPreferences>

/** Shows Media Detail behavior options without owning the preference session. */
export function PersonalPreferencesPreviewSection({ compact, model }: { compact: boolean; model: PreferencesModel }) {
  const { preferences, change, fieldErrors } = model
  const loop = preferences.mediaDetailNavigationWrap
  const wideDetails = preferences.mediaDetailInitialInfoWide
  const mediumDetails = preferences.mediaDetailInitialInfoMedium
  return (
    <>
      <Box>
        <SectionHeader>プレビュー</SectionHeader>
        <Stack gap="xl">
          <SettingRow
            compact={compact}
            label="Media Detailの前後Navigation循環"
            description="最後まで進んだら最初のMediaに戻ります。"
          >
            <Switch
              checked={loop}
              error={fieldErrors.mediaDetailNavigationWrap?.message}
              onChange={(event) =>
                change("mediaDetailNavigationWrap", event.currentTarget.checked)
              }
              label={loop ? "オン" : "オフ"}
            />
          </SettingRow>
          <SettingRow
            compact={compact}
            label="詳細情報の初期表示（Wide）"
            description="WideでMedia Detailを開くときに詳細情報を展開します。"
          >
            <Switch
              checked={wideDetails}
              error={fieldErrors.mediaDetailInitialInfoWide?.message}
              onChange={(event) =>
                change(
                  "mediaDetailInitialInfoWide",
                  event.currentTarget.checked,
                )
              }
              label={wideDetails ? "オン" : "オフ"}
            />
          </SettingRow>
          <SettingRow
            compact={compact}
            label="詳細情報の初期表示（Medium）"
            description="MediumでMedia Detailを開くときに詳細情報を展開します。"
          >
            <Switch
              checked={mediumDetails}
              error={fieldErrors.mediaDetailInitialInfoMedium?.message}
              onChange={(event) =>
                change(
                  "mediaDetailInitialInfoMedium",
                  event.currentTarget.checked,
                )
              }
              label={mediumDetails ? "オン" : "オフ"}
            />
          </SettingRow>
        </Stack>
      </Box>    </>
  )
}
