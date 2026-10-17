"use client"

import {
  Box,
  Button,
  ColorInput,
  Group,
  Select,
  Stack,
  Switch,
  Text,
  TextInput,
  useMantineColorScheme,
} from "@mantine/core"
import { useMediaQuery } from "@mantine/hooks"
import {
  IconChartBar,
  IconSettings,
  IconUser,
  IconUserCircle,
} from "@tabler/icons-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { FeedbackAlert, showNotification } from "@/components/Feedback"
import { NavigationItem } from "@/components/NavigationItem"
import { PageHeader } from "@/components/PageHeader"
import { SectionHeader } from "@/components/SectionHeader"
import { SettingRow } from "@/components/SettingRow"
import { SettingsUsage, type SettingsUsageData } from "./SettingsUsage"
import { usePreferencesSave } from "./usePreferencesSave"
import {
  defaultUserPreferences,
  type UserPreferences,
  type UserPreferencesPatch,
} from "./userPreferences"

type Section = "profile" | "preferences" | "usage" | "account"

const sections = [
  { id: "profile", label: "プロフィール", icon: IconUser },
  { id: "account", label: "アカウント", icon: IconUserCircle },
  { id: "preferences", label: "環境設定", icon: IconSettings },
  { id: "usage", label: "利用状況", icon: IconChartBar },
] satisfies { id: Section; label: string; icon: typeof IconUser }[]

const MOCK_PROFILE = { nickname: "ユーザー" }

// Static sample values remain until the Usage data connection is implemented.
const MOCK_USAGE: SettingsUsageData = {
  usedStorageLabel: "1.24 GB",
  effectiveLimitLabel: "5 GB",
  availableStorageLabel: "3.76 GB",
  storageUsagePercent: 24.8,
  mediaCount: 1248,
  formatBreakdown: [
    { format: "JPEG", count: 900, sizeLabel: "0.90 GB", capacityPercent: 18 },
    { format: "PNG", count: 200, sizeLabel: "0.20 GB", capacityPercent: 4 },
    { format: "WebP", count: 100, sizeLabel: "0.10 GB", capacityPercent: 2 },
    {
      format: "HEIC / HEIF",
      count: 48,
      sizeLabel: "0.04 GB",
      capacityPercent: 0.8,
    },
  ],
}

type ProfileSaveErrorKind = "retryable" | "blocked"
type ProfileSaveError = { kind: ProfileSaveErrorKind }
type SaveProfile = (nickname: string) => Promise<void>

async function saveMockProfile() {
  await new Promise((resolve) => setTimeout(resolve, 500))
}

function isBlockingProfileSaveError(error: unknown): error is ProfileSaveError {
  return (
    typeof error === "object" &&
    error !== null &&
    "kind" in error &&
    error.kind === "blocked"
  )
}

function ProfileContent({
  onSave = saveMockProfile,
  initialNickname = MOCK_PROFILE.nickname,
}: {
  onSave?: SaveProfile
  initialNickname?: string
}) {
  const [name, setName] = useState(initialNickname)
  const [saved, setSaved] = useState(initialNickname)
  const [saveState, setSaveState] = useState<
    "idle" | "saving" | "retryable-error" | "blocked"
  >("idle")
  const normalized = name.trim()
  const dirty = normalized !== saved
  const invalid = normalized.length === 0
  const isSaving = saveState === "saving"
  const isBlocked = saveState === "blocked"

  const save = async () => {
    if (!dirty || invalid || isSaving || isBlocked) return

    setSaveState("saving")
    try {
      await onSave(normalized)
      setSaved(normalized)
      setName(normalized)
      setSaveState("idle")
      showNotification({
        kind: "success",
        title: "プロフィールを保存",
        description: "プロフィールを更新しました。",
      })
    } catch (error) {
      setSaveState(
        isBlockingProfileSaveError(error) ? "blocked" : "retryable-error",
      )
    }
  }

  return (
    <Stack gap="xl">
      <PageHeader
        title="プロフィール"
        description="プロフィール情報を変更します。"
      />
      <Box>
        <SectionHeader>基本情報</SectionHeader>
        <Stack gap="md" maw={540}>
          {saveState === "retryable-error" && (
            <FeedbackAlert
              kind="error"
              title="保存の完了を確認できませんでした"
              role="alert"
            >
              入力内容は保持されています。内容を確認して、もう一度保存してください。
            </FeedbackAlert>
          )}
          {isBlocked && (
            <FeedbackAlert
              kind="error"
              title="プロフィールを変更できません"
              role="alert"
            >
              Userの状態が変わったため、この画面での変更を続けられません。画面を再読み込みして現在の状態を確認してください。
            </FeedbackAlert>
          )}
          <TextInput
            label="ニックネーム"
            description="Memoriaで表示する名前です。"
            value={name}
            onChange={(event) => setName(event.currentTarget.value)}
            error={invalid ? "ニックネームを入力してください。" : undefined}
            required
            disabled={isSaving || isBlocked}
          />
          <Button
            size="sm"
            style={{ alignSelf: "flex-start" }}
            disabled={!dirty || invalid || isSaving || isBlocked}
            loading={isSaving}
            onClick={save}
          >
            {saveState === "retryable-error"
              ? "再試行"
              : isSaving
                ? "更新中"
                : "更新"}
          </Button>
        </Stack>
      </Box>
    </Stack>
  )
}

function PreferencesContent({
  compact,
  initialPreferences = defaultUserPreferences,
  onSave,
}: {
  compact: boolean
  initialPreferences?: UserPreferences
  onSave?: (patch: UserPreferencesPatch) => Promise<UserPreferences>
}) {
  const { colorScheme, setColorScheme } = useMantineColorScheme()
  const [preferences, setPreferences] =
    useState<UserPreferences>(initialPreferences)
  const [accentDraft, setAccentDraft] = useState(
    initialPreferences.personalAccentColor,
  )
  const { saveError, enqueue, retry } = usePreferencesSave(onSave)

  const change = <K extends keyof UserPreferences>(
    key: K,
    value: UserPreferences[K],
  ) => {
    if (saveError === "blocked") return
    setPreferences((current) => ({ ...current, [key]: value }))
    enqueue({ [key]: value } as UserPreferencesPatch)
  }
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
              onChange={(value) => {
                setAccentDraft(value)
                if (/^#[0-9a-fA-F]{6}$/.test(value))
                  change("personalAccentColor", value.toUpperCase())
              }}
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

function UsageContent() {
  return <SettingsUsage usage={MOCK_USAGE} />
}

function AccountContent() {
  return (
    <Stack gap="xl">
      <PageHeader title="アカウント" description="アカウントを管理します。" />
      <Box>
        <Box c="red">
          <SectionHeader>アカウント削除</SectionHeader>
        </Box>
        <Stack gap="md" maw={620}>
          <Text size="sm">
            アカウントと関連データを削除します。削除前に、対象データとCommunityへの影響を確認できます。
          </Text>
          <Box>
            <Button
              component={Link}
              href="/settings/account/delete"
              color="red"
              size="sm"
            >
              アカウントを削除する
            </Button>
          </Box>
        </Stack>
      </Box>
    </Stack>
  )
}

export function Settings({
  section,
  saveProfile,
  profileNickname,
  initialPreferences,
  savePreferences,
}: {
  section: Section
  saveProfile?: SaveProfile
  profileNickname?: string
  initialPreferences?: UserPreferences
  savePreferences?: (patch: UserPreferencesPatch) => Promise<UserPreferences>
}) {
  const router = useRouter()
  const compact = useMediaQuery("(max-width: 48em)")
  const content =
    section === "profile" ? (
      <ProfileContent onSave={saveProfile} initialNickname={profileNickname} />
    ) : section === "preferences" ? (
      <PreferencesContent
        compact={compact}
        initialPreferences={initialPreferences}
        onSave={savePreferences}
      />
    ) : section === "usage" ? (
      <UsageContent />
    ) : (
      <AccountContent />
    )

  return (
    <Box maw={1120} mx="auto" w="100%">
      {compact ? (
        <Stack gap="xl">
          <Box>
            <Text size="xs" c="dimmed" mb={6}>
              設定
            </Text>
            <Select
              aria-label="設定画面"
              value={section}
              onChange={(value) => value && router.push(`/settings/${value}`)}
              data={sections.map((item) => ({
                value: item.id,
                label: item.label,
              }))}
              allowDeselect={false}
            />
          </Box>
          <Box>{content}</Box>
        </Stack>
      ) : (
        <Group align="flex-start" gap={56} wrap="nowrap">
          <Box
            component="nav"
            aria-label="設定"
            w={200}
            style={{ flexShrink: 0 }}
          >
            <Text size="xs" fw={700} c="dimmed" mb="xs">
              設定
            </Text>
            <Stack gap={0}>
              {sections.map((item) => (
                <NavigationItem
                  key={item.id}
                  label={item.label}
                  icon={item.icon}
                  active={section === item.id}
                  accentColor="var(--mantine-color-blue-6)"
                  onClick={() => router.push(`/settings/${item.id}`)}
                />
              ))}
            </Stack>
          </Box>
          <Box style={{ flex: 1 }} maw={760} miw={0}>
            {content}
          </Box>
        </Group>
      )}
    </Box>
  )
}
