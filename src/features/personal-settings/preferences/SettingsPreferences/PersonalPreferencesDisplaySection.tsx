"use client"

import { Box, ColorInput, Select, Stack, useMantineColorScheme } from "@mantine/core"
import { SectionHeader } from "@/components/SectionHeader"
import { SettingRow } from "@/components/SettingRow"
import type { UserPreferences } from "../userPreferences"
import type { useUserPreferences } from "./useUserPreferences"
type PreferencesModel = ReturnType<typeof useUserPreferences>

/** Shows personal appearance and formatting preferences without owning saves. */
export function PersonalPreferencesDisplaySection({ compact, model }: { compact: boolean; model: PreferencesModel }) {
  const { colorScheme, setColorScheme } = useMantineColorScheme()
  const { preferences, accentDraft, accentOnBlur, accentDraftError, change, changeAccentDraft, fieldErrors } = model
  const dateFormat = preferences.dateFormat
  const fileSizeUnit = preferences.fileSizeUnit
  const thumbnailSize = preferences.mediaThumbnailSize
  return (
    <>
      <Box>
        <SectionHeader>表示</SectionHeader>
        <Stack gap="xl">
          <SettingRow
            compact={compact}
            label="表示テーマ"
            description="画面の表示テーマを選びます。"
          >
            <Select
              aria-label="表示テーマ"
              value={colorScheme}
              onChange={(value) =>
                value && setColorScheme(value as "auto" | "light" | "dark")
              }
              data={[
                { value: "auto", label: "システム" },
                { value: "light", label: "ライト" },
                { value: "dark", label: "ダーク" },
              ]}
              allowDeselect={false}
            />
          </SettingRow>
          <SettingRow
            compact={compact}
            label="Personal Accent Color"
            description="Personal Contextのアクセントカラーを選びます。"
          >
            <ColorInput
              aria-label="Personal Accent Color"
              error={fieldErrors.personalAccentColor?.message ?? accentDraftError}
              onBlur={accentOnBlur}
              format="hex"
              value={accentDraft}
              onChange={changeAccentDraft}
            />
          </SettingRow>
          <SettingRow
            compact={compact}
            label="日付形式"
            description="日付の表示形式を選びます。"
          >
            <Select
              aria-label="日付形式"
              error={fieldErrors.dateFormat?.message}
              value={dateFormat}
              onChange={(value) =>
                value &&
                change("dateFormat", value as UserPreferences["dateFormat"])
              }
              data={[
                { value: "YYYY_MM_DD", label: "YYYY/MM/DD" },
                { value: "MM_DD_YYYY", label: "MM/DD/YYYY" },
                { value: "DD_MM_YYYY", label: "DD/MM/YYYY" },
              ]}
              allowDeselect={false}
            />
          </SettingRow>
          <SettingRow
            compact={compact}
            label="ファイルサイズの単位"
            description="Mediaサイズの表示単位を選びます。"
          >
            <Select
              aria-label="ファイルサイズの単位"
              error={fieldErrors.fileSizeUnit?.message}
              value={fileSizeUnit}
              onChange={(value) =>
                value &&
                change("fileSizeUnit", value as UserPreferences["fileSizeUnit"])
              }
              data={[
                { value: "DECIMAL", label: "SI（KB, MB, GB）" },
                { value: "BINARY", label: "2進（KiB, MiB, GiB）" },
              ]}
              allowDeselect={false}
            />
          </SettingRow>
          <SettingRow
            compact={compact}
            label="Mediaサムネイルサイズ"
            description="Media一覧のサムネイルサイズを選びます。"
          >
            <Select
              aria-label="Mediaサムネイルサイズ"
              error={fieldErrors.mediaThumbnailSize?.message}
              value={thumbnailSize}
              onChange={(value) =>
                value &&
                change(
                  "mediaThumbnailSize",
                  value as UserPreferences["mediaThumbnailSize"],
                )
              }
              data={[
                { value: "SMALL", label: "小" },
                { value: "MEDIUM", label: "中" },
                { value: "LARGE", label: "大" },
              ]}
              allowDeselect={false}
            />
          </SettingRow>
        </Stack>
      </Box>
    </>
  )
}
