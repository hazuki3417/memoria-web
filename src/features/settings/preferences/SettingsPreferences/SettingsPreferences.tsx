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
import { SaveStatus } from "@/components/SaveStatus"
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
  onInspect,
}: {
  compact: boolean
  initialPreferences?: UserPreferences
  onSave?: (patch: UserPreferencesPatch) => Promise<UserPreferences>
  onInspect?: () => Promise<UserPreferences>
}) {
  const { colorScheme, setColorScheme } = useMantineColorScheme()
  const {
    preferences,
    accentDraft,
    accentOnBlur,
    accentDraftError,
    change,
    changeAccentDraft,
    saveError,
    saveStatus,
    fieldErrors,
    validation,
    retry,
    inspect,
    confirmObservation,
    discard,
    inspected,
    observedMatches,
    hasSession,
    canRetry,
  } = useUserPreferences(initialPreferences, onSave, onInspect)
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
        titleAccessory={
          onSave ? (
            <SaveStatus
              state={saveError ? "attention" : saveStatus}
              announce
              timing={{
                savingDelayMs: 300,
                savedDurationMs: 2000,
                savingAnnouncementMs: 2000,
              }}
            />
          ) : undefined
        }
      />
      {saveError && (
        <FeedbackAlert
          kind="error"
          title={
            saveError === "blocked"
              ? "設定を変更できません"
              : saveError === "validation"
                ? "入力内容を確認してください"
                : saveError === "unknown"
                ? "保存結果を確認できませんでした"
                : "保存できませんでした"
          }
          role="alert"
        >
          <Stack gap="xs">
            {saveError === "validation" ? (
              <span>
                {validation?.formError
                  ? "保存できない入力の組み合わせがあります。内容を修正してから再保存してください。"
                  : "入力項目のエラーを修正してから、もう一度保存してください。"}
              </span>
            ) : saveError === "blocked" ? (
              <span>画面を再読み込みして現在の状態を確認してください。</span>
            ) : saveError === "unknown" ? (
              <span>
                変更内容は保持しています。現在のServer値を確認してから、必要に応じて手動で保存してください。
              </span>
            ) : (
              <span>
                変更内容を保持しています。内容を確認して再試行してください。
              </span>
            )}
            {saveError === "unknown" && inspected && (
              <span>
                {observedMatches
                  ? "現在の設定は入力した値と一致しています。旧Mutationの成功を証明するものではありません。"
                  : "現在のServer値と入力した値が一致しません。"}
              </span>
            )}
            {saveError === "unknown" && (
              <Button size="xs" variant="light" onClick={() => void inspect()}>
                現在の状態を確認
              </Button>
            )}
            {saveError === "unknown" && observedMatches && (
              <Button size="xs" variant="light" onClick={confirmObservation}>
                確認完了
              </Button>
            )}
            {((saveError === "retryable" || saveError === "validation") ||
              (saveError === "unknown" && inspected && !observedMatches)) && (
              <Button size="xs" disabled={!canRetry} onClick={retry}>
                もう一度保存
              </Button>
            )}
            {hasSession && saveError !== "blocked" && (
              <Button size="xs" variant="subtle" color="gray" onClick={discard}>
                変更を破棄
              </Button>
            )}
          </Stack>
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
      </Box>
    </Stack>
  )
}
