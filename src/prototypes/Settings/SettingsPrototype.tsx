"use client"

import {
  Box,
  Button,
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
import { useState } from "react"
import { getApplicationNavigation } from "@/components/ApplicationShell"
import { NavigationItem } from "@/components/NavigationItem"
import { FeedbackAlert, showNotification } from "@/components/Feedback"
import { PageHeader } from "@/components/PageHeader"
import { SectionHeader } from "@/components/SectionHeader"
import { SettingRow } from "@/components/SettingRow"
import { SettingsUsage, type SettingsUsageData } from "@/features/settings"
import { PrototypeApplicationShell } from "@/prototypes/PrototypeApplicationShell"

type Section = "profile" | "preferences" | "usage" | "account"

const sections = [
  { id: "profile", label: "プロフィール", icon: IconUser },
  { id: "preferences", label: "環境設定", icon: IconSettings },
  { id: "usage", label: "利用状況", icon: IconChartBar },
  { id: "account", label: "アカウント", icon: IconUserCircle },
] satisfies { id: Section; label: string; icon: typeof IconUser }[]

type ProfileSaveState = "idle" | "saving" | "retryable-error" | "blocked"

const MOCK_PROFILE = { nickname: "ユーザー" }

// Deterministic Storybook sample data; these values are not product values.
const MOCK_USAGE: SettingsUsageData = {
  usedStorageLabel: "1.24 GB",
  effectiveLimitLabel: "5 GB",
  storageUsagePercent: 24.8,
  mediaCount: 1248,
  formatBreakdown: [
    { format: "JPEG", count: 900, sizeLabel: "0.90 GB" },
    { format: "PNG", count: 200, sizeLabel: "0.20 GB" },
    { format: "WebP", count: 100, sizeLabel: "0.10 GB" },
    { format: "HEIC / HEIF", count: 48, sizeLabel: "0.04 GB" },
  ],
}

function ProfileContent({
  initialSaveState = "idle",
}: {
  initialSaveState?: ProfileSaveState
}) {
  const initialName = initialSaveState === "saving" || initialSaveState === "retryable-error"
    ? "ユーザー新"
    : MOCK_PROFILE.nickname
  const [name, setName] = useState(initialName)
  const [saved, setSaved] = useState(MOCK_PROFILE.nickname)
  const [saveState, setSaveState] = useState<ProfileSaveState>(initialSaveState)
  const normalized = name.trim()
  const dirty = normalized !== saved
  const invalid = normalized.length === 0
  const blocked = saveState === "blocked"
  const saving = saveState === "saving"

  const save = async () => {
    if (!dirty || invalid || blocked || saving) return

    setSaveState("saving")
    await new Promise((resolve) => setTimeout(resolve, 500))
    setSaved(normalized)
    setName(normalized)
    setSaveState("idle")
    showNotification({
      kind: "success",
      title: "保存しました",
      message: "プロフィールを更新しました。",
    })
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
          {blocked && (
            <FeedbackAlert
              kind="error"
              title="プロフィールを変更できません"
              role="alert"
            >
              Userの状態が変わったため、この画面での変更を続けられません。ページを再読み込みして現在の状態を確認してください。
            </FeedbackAlert>
          )}
          {saveState === "retryable-error" && (
            <FeedbackAlert
              kind="error"
              title="保存の完了を確認できませんでした"
              role="alert"
            >
              入力内容は保持されています。内容を確認して、もう一度保存してください。
            </FeedbackAlert>
          )}
          <TextInput
            label="ニックネーム"
            description="Memoriaで表示する名前です。"
            value={name}
            onChange={(event) => setName(event.currentTarget.value)}
            error={invalid ? "ニックネームを入力してください。" : undefined}
            required
            disabled={blocked || saving}
          />
          <Button
            size="sm"
            disabled={!dirty || invalid || blocked || saving}
            loading={saving}
            onClick={save}
          >
            {saveState === "retryable-error" ? "再試行" : saving ? "保存中" : "保存"}
          </Button>
        </Stack>
      </Box>
    </Stack>
  )
}

function PreferencesContent({ compact }: { compact: boolean }) {
  const { colorScheme, setColorScheme } = useMantineColorScheme()
  const [dateFormat, setDateFormat] = useState("YYYY-MM-DD")
  const [fileSizeUnit, setFileSizeUnit] = useState("SI")
  const [loop, setLoop] = useState(true)
  const [showDetails, setShowDetails] = useState(false)

  return (
    <Stack gap="xl">
      <PageHeader
        title="環境設定"
        description="表示とプレビューの動作を設定します。"
      />
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
            label="日付形式"
            description="日付の表示形式を選びます。"
          >
            <Select
              aria-label="日付形式"
              value={dateFormat}
              onChange={(value) => value && setDateFormat(value)}
              data={["YYYY-MM-DD"]}
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
              onChange={(value) => value && setFileSizeUnit(value)}
              data={[
                { value: "SI", label: "SI（KB, MB, GB）" },
                { value: "BINARY", label: "2進（KiB, MiB, GiB）" },
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
            label="繰り返し表示"
            description="最後まで進んだら最初のMediaに戻ります。"
          >
            <Switch
              checked={loop}
              onChange={(event) => setLoop(event.currentTarget.checked)}
              label={loop ? "オン" : "オフ"}
            />
          </SettingRow>
          <SettingRow
            compact={compact}
            label="詳細情報を表示"
            description="プレビューを開いたときに詳細情報を表示します。"
          >
            <Switch
              checked={showDetails}
              onChange={(event) => setShowDetails(event.currentTarget.checked)}
              label={showDetails ? "オン" : "オフ"}
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
        <SectionHeader>アカウント削除</SectionHeader>
        <Stack gap="md" maw={620}>
          <Text size="sm">
            アカウントと関連データを削除します。削除前に、対象データとCommunityへの影響を確認できます。
          </Text>
          <Box>
            <Button variant="default" size="sm">
              アカウントを削除する
            </Button>
          </Box>
        </Stack>
      </Box>
    </Stack>
  )
}

export function SettingsPrototype({
  initialSection = "profile",
  initialProfileSaveState = "idle",
}: {
  initialSection?: Section
  initialProfileSaveState?: ProfileSaveState
}) {
  const compact = useMediaQuery("(max-width: 48em)")
  const [section, setSection] = useState<Section>(initialSection)
  const currentLabel = sections.find((item) => item.id === section)?.label

  const content =
    section === "profile" ? (
      <ProfileContent initialSaveState={initialProfileSaveState} />
    ) : section === "preferences" ? (
      <PreferencesContent compact={compact} />
    ) : section === "usage" ? (
      <UsageContent />
    ) : (
      <AccountContent />
    )

  return (
    <PrototypeApplicationShell
      currentContext={{
        id: "personal",
        kind: "personal",
        label: "Personal",
        accentColor: "var(--mantine-color-blue-6)",
      }}
      contexts={[
        {
          id: "personal",
          kind: "personal",
          label: "Personal",
          accentColor: "var(--mantine-color-blue-6)",
        },
        {
          id: "family",
          kind: "community",
          label: "家族のアルバム",
          accentColor: "var(--mantine-color-teal-6)",
        },
        {
          id: "travel",
          kind: "community",
          label: "旅行の思い出",
          accentColor: "var(--mantine-color-violet-6)",
        },
      ]}
      navigationItems={getApplicationNavigation({
        contextKind: "personal",
      })}
      user={{ displayName: "ユーザー" }}
      onSelectContext={() => undefined}
      onSelectNavigation={() => undefined}
      onCreateCommunity={() => undefined}
      onOpenSettings={() => undefined}
      onLogout={() => undefined}
    >
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
                onChange={(value) => value && setSection(value as Section)}
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
                    onClick={() => setSection(item.id)}
                  />
                ))}
              </Stack>
            </Box>
            <Box style={{ flex: 1 }} maw={760} miw={0}>
              {content}
            </Box>
          </Group>
        )}
        <Text
          pos="absolute"
          style={{
            width: 1,
            height: 1,
            overflow: "hidden",
            clip: "rect(0 0 0 0)",
          }}
        >
          現在の設定: {currentLabel}
        </Text>
      </Box>
    </PrototypeApplicationShell>
  )
}
