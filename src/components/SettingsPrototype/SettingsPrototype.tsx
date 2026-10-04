"use client"

import {
  Box,
  Button,
  Group,
  Progress,
  Select,
  Stack,
  Switch,
  Table,
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
import { PrototypeApplicationShell, getApplicationNavigation } from "@/components/ApplicationShell"
import { NavigationItem } from "@/components/NavigationItem"
import { PageHeader } from "@/components/PageHeader"
import { SectionHeader } from "@/components/SectionHeader"
import { SettingRow } from "@/components/SettingRow"

type Section = "profile" | "preferences" | "usage" | "account"

const sections = [
  { id: "profile", label: "プロフィール", icon: IconUser },
  { id: "preferences", label: "環境設定", icon: IconSettings },
  { id: "usage", label: "利用状況", icon: IconChartBar },
  { id: "account", label: "アカウント", icon: IconUserCircle },
] satisfies { id: Section; label: string; icon: typeof IconUser }[]

function ProfileContent() {
  const [name, setName] = useState("ユーザー")
  const [saved, setSaved] = useState("ユーザー")
  const normalized = name.trim()
  const dirty = normalized !== saved
  const invalid = normalized.length === 0

  return (
    <Stack gap="xl">
      <PageHeader
        title="プロフィール"
        description="プロフィール情報を変更します。"
      />
      <Box>
        <SectionHeader>基本情報</SectionHeader>
        <Stack gap="md" maw={540}>
          <TextInput
            label="ニックネーム"
            description="Memoriaで表示する名前です。"
            value={name}
            onChange={(event) => setName(event.currentTarget.value)}
            error={invalid ? "ニックネームを入力してください。" : undefined}
            required
          />
          <Group gap="sm">
            <Button
              size="sm"
              disabled={!dirty || invalid}
              onClick={() => {
                setSaved(normalized)
                setName(normalized)
              }}
            >
              保存
            </Button>
            {dirty && (
              <Button
                size="sm"
                variant="default"
                onClick={() => setName(saved)}
              >
                キャンセル
              </Button>
            )}
          </Group>
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
  return (
    <Stack gap="xl">
      <PageHeader
        title="利用状況"
        description="ストレージの使用量とアップロード上限を確認します。"
      />
      <Box>
        <SectionHeader>ストレージ</SectionHeader>
        <Stack gap="sm">
          <Group justify="space-between" align="end">
            <Box>
              <Text fw={700} size="xl">
                12.4 GB 使用中
              </Text>
              <Text size="sm" c="dimmed">
                50 GB 中
              </Text>
            </Box>
            <Text size="sm" fw={600}>
              25%
            </Text>
          </Group>
          <Progress value={25} size="md" aria-label="ストレージ使用率 25%" />
        </Stack>
      </Box>
      <Box>
        <SectionHeader>Media</SectionHeader>
        <Table.ScrollContainer minWidth={420}>
          <Table verticalSpacing="sm">
            <Table.Thead>
              <Table.Tr>
                <Table.Th>種類</Table.Th>
                <Table.Th ta="right">件数</Table.Th>
                <Table.Th ta="right">使用量</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              <Table.Tr>
                <Table.Td fw={600}>すべて</Table.Td>
                <Table.Td ta="right">1,248件</Table.Td>
                <Table.Td ta="right">12.4 GB</Table.Td>
              </Table.Tr>
              <Table.Tr>
                <Table.Td>JPEG</Table.Td>
                <Table.Td ta="right">1,020件</Table.Td>
                <Table.Td ta="right">10.8 GB</Table.Td>
              </Table.Tr>
              <Table.Tr>
                <Table.Td>PNG</Table.Td>
                <Table.Td ta="right">228件</Table.Td>
                <Table.Td ta="right">1.6 GB</Table.Td>
              </Table.Tr>
            </Table.Tbody>
          </Table>
        </Table.ScrollContainer>
      </Box>
      <Box>
        <SectionHeader>アップロード</SectionHeader>
        <Stack gap="md">
          {[
            ["1回のアップロード", "100 Media"],
            ["1 Mediaのサイズ", "50 MB"],
            ["対応形式", "JPEG, PNG"],
          ].map(([label, value]) => (
            <Group key={label} justify="space-between" gap="xl" wrap="nowrap">
              <Text size="sm" c="dimmed">
                {label}
              </Text>
              <Text size="sm" fw={600} ta="right">
                {value}
              </Text>
            </Group>
          ))}
        </Stack>
      </Box>
    </Stack>
  )
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
}: {
  initialSection?: Section
}) {
  const compact = useMediaQuery("(max-width: 48em)")
  const [section, setSection] = useState<Section>(initialSection)
  const currentLabel = sections.find((item) => item.id === section)?.label

  const content =
    section === "profile" ? (
      <ProfileContent />
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
