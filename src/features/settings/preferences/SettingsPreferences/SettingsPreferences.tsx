"use client"

import {
  Box,
  Button,
  ColorInput,
  Select,
  Stack,
  Switch,
  useMantineColorScheme,
} from "@mantine/core"
import { FeedbackAlert } from "@/components/Feedback"
import { PageHeader } from "@/components/PageHeader"
import { SectionHeader } from "@/components/SectionHeader"
import { SettingRow } from "@/components/SettingRow"
import { useUserPreferences } from "../useUserPreferences"
import {
  defaultUserPreferences,
  type UserPreferences,
  type UserPreferencesPatch,
} from "../userPreferences"

export function SettingsPreferences({
  compact,
  initialPreferences = defaultUserPreferences,
  onSave,
}: {
  compact: boolean
  initialPreferences?: UserPreferences
  onSave?: (patch: UserPreferencesPatch) => Promise<UserPreferences>
}) {
  const { colorScheme, setColorScheme } = useMantineColorScheme()
  const {
    preferences,
    accentDraft,
    change,
    changeAccentDraft,
    saveError,
    retry,
  } = useUserPreferences(initialPreferences, onSave)
  const dateFormat = preferences.dateFormat
  const fileSizeUnit = preferences.fileSizeUnit
  const loop = preferences.mediaDetailNavigationWrap
  const wideDetails = preferences.mediaDetailInitialInfoWide
  const mediumDetails = preferences.mediaDetailInitialInfoMedium
  const thumbnailSize = preferences.mediaThumbnailSize

  return (
    <Stack gap="xl">
      <PageHeader
        title="環境設定"
        description="表示とプレビューの動作を設定します。"
      />
      {saveError && (
        <FeedbackAlert
          kind="error"
          title={
            saveError === "blocked"
              ? "設定を変更できません"
              : "保存できませんでした"
          }
          role="alert"
        >
          {saveError === "blocked"
            ? "画面を再読み込みして現在の状態を確認してください。"
            : "変更内容を保持しています。再試行すると変更内容を保存します。"}
          {saveError === "retryable" && (
            <Button size="xs" onClick={retry}>
              再試行
            </Button>
          )}
        </FeedbackAlert>
      )}
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
      </Box>
    </Stack>
  )
}
