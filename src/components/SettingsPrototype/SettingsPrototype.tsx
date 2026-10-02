"use client"

import {
  AppShell,
  Box,
  Button,
  Divider,
  Group,
  NavLink,
  Progress,
  Select,
  Stack,
  Switch,
  Table,
  Text,
  TextInput,
  Title,
} from "@mantine/core"
import { useMediaQuery } from "@mantine/hooks"
import { useState } from "react"

type Section = "profile" | "preferences" | "usage" | "account"

const sections: { id: Section; label: string }[] = [
  { id: "profile", label: "プロフィール" },
  { id: "preferences", label: "環境設定" },
  { id: "usage", label: "利用状況" },
  { id: "account", label: "アカウント" },
]

function PageHeader({
  title,
  description,
}: {
  title: string
  description: string
}) {
  return (
    <Box>
      <Title order={1} size="h2">{title}</Title>
      <Text c="dimmed" size="sm" mt={4}>{description}</Text>
    </Box>
  )
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <Box>
      <Title order={2} size="h4">{children}</Title>
      <Divider mt="sm" mb="lg" />
    </Box>
  )
}

function SettingRow({
  label,
  description,
  children,
  compact,
}: {
  label: string
  description: string
  children: React.ReactNode
  compact: boolean
}) {
  return (
    <Group
      justify="space-between"
      align={compact ? "stretch" : "center"}
      wrap={compact ? "wrap" : "nowrap"}
      gap="md"
    >
      <Box style={{ flex: 1 }} miw={0}>
        <Text fw={600} size="sm">{label}</Text>
        <Text c="dimmed" size="sm" mt={2}>{description}</Text>
      </Box>
      <Box w={compact ? "100%" : 180}>{children}</Box>
    </Group>
  )
}

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
        description="Memoriaで使用するプロフィール情報を管理します。"
      />
      <Box>
        <SectionTitle>基本情報</SectionTitle>
        <Stack gap="md" maw={540}>
          <TextInput
            label="ニックネーム"
            description="Memoria内で表示される名前です。"
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
              <Button size="sm" variant="default" onClick={() => setName(saved)}>
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
  const [dateFormat, setDateFormat] = useState("YYYY-MM-DD")
  const [fileSizeUnit, setFileSizeUnit] = useState("SI")
  const [loop, setLoop] = useState(true)
  const [showDetails, setShowDetails] = useState(false)

  return (
    <Stack gap="xl">
      <PageHeader
        title="環境設定"
        description="Memoriaの表示や操作方法を設定します。"
      />
      <Box>
        <SectionTitle>表示</SectionTitle>
        <Stack gap="xl">
          <SettingRow
            compact={compact}
            label="日付形式"
            description="日付を表示するときの形式です。"
          >
            <Select
              aria-label="日付形式"
              value={dateFormat}
              onChange={(value) => value && setDateFormat(value)}
              data={["YYYY-MM-DD", "YYYY/MM/DD", "MM/DD/YYYY", "DD/MM/YYYY"]}
              allowDeselect={false}
            />
          </SettingRow>
          <SettingRow
            compact={compact}
            label="ファイルサイズの単位"
            description="Mediaのサイズを表示するときの単位です。"
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
        <SectionTitle>プレビュー</SectionTitle>
        <Stack gap="xl">
          <SettingRow
            compact={compact}
            label="繰り返し表示"
            description="最後のMediaの次に最初のMediaへ戻ります。"
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
            description="プレビューを開いたときから詳細情報を表示します。"
          >
            <Switch
              checked={showDetails}
              onChange={(event) => setShowDetails(event.currentTarget.checked)}
              label={showDetails ? "オン" : "オフ"}
            />
          </SettingRow>
        </Stack>
      </Box>
      <Text size="xs" c="dimmed">
        このプロトタイプでは変更を即時反映します。APIへの保存は行いません。
      </Text>
    </Stack>
  )
}

function UsageContent() {
  return (
    <Stack gap="xl">
      <PageHeader
        title="利用状況"
        description="Mediaの使用量とアップロードの制限を確認できます。"
      />
      <Box>
        <SectionTitle>ストレージ</SectionTitle>
        <Stack gap="sm">
          <Group justify="space-between" align="end">
            <Box>
              <Text fw={700} size="xl">12.4 GB 使用中</Text>
              <Text size="sm" c="dimmed">50 GB 中</Text>
            </Box>
            <Text size="sm" fw={600}>25%</Text>
          </Group>
          <Progress value={25} size="md" aria-label="ストレージ使用率 25%" />
        </Stack>
      </Box>
      <Box>
        <SectionTitle>Media</SectionTitle>
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
        <SectionTitle>アップロード</SectionTitle>
        <Stack gap="md">
          {[
            ["1回のアップロード", "最大100 Media"],
            ["1 Mediaのサイズ", "最大50 MB"],
            ["対応形式", "JPEG, PNG"],
          ].map(([label, value]) => (
            <Group key={label} justify="space-between" gap="xl" wrap="nowrap">
              <Text size="sm" c="dimmed">{label}</Text>
              <Text size="sm" fw={600} ta="right">{value}</Text>
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
      <PageHeader
        title="アカウント"
        description="Memoriaアカウントに関する操作を行います。"
      />
      <Box>
        <SectionTitle>アカウント削除</SectionTitle>
        <Stack gap="md" maw={620}>
          <Text size="sm">
            Memoriaのアカウントと関連するデータを削除します。削除する前に、削除されるデータとCommunityへの影響を確認します。
          </Text>
          <Box>
            <Button variant="default" size="sm">
              アカウント削除について確認
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
    <AppShell header={{ height: 40 }} padding="lg">
      <AppShell.Header>
        <Group h="100%" px="md" justify="space-between">
          <Group gap="sm">
            <Text fw={750} size="lg">Memoria</Text>
            <Text c="dimmed" size="sm">/</Text>
            <Text size="sm">設定</Text>
          </Group>
          <Button variant="subtle" color="gray" size="compact-sm">
            ユーザー
          </Button>
        </Group>
      </AppShell.Header>
      <AppShell.Main>
        <Box maw={1120} mx="auto" w="100%">
          {compact ? (
            <Stack gap="xl">
              <Box>
                <Text size="xs" c="dimmed" mb={6}>設定</Text>
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
              <Box component="nav" aria-label="設定" w={200} style={{ flexShrink: 0 }}>
                <Text size="xs" fw={700} c="dimmed" mb="xs">設定</Text>
                <Stack gap={0}>
                  {sections.map((item) => (
                    <Box key={item.id} pos="relative" pl={8}>
                      {section === item.id && (
                        <Box
                          pos="absolute"
                          top={3}
                          bottom={3}
                          left={0}
                          w={3}
                          bg="var(--mantine-color-blue-6)"
                          style={{
                            borderRadius: "var(--mantine-radius-xl)",
                            pointerEvents: "none",
                          }}
                          aria-hidden="true"
                        />
                      )}
                      <NavLink
                        label={item.label}
                        active={section === item.id}
                        onClick={() => setSection(item.id)}
                        variant="subtle"
                        color="gray"
                        styles={{
                          root: {
                            borderRadius: "var(--mantine-radius-sm)",
                            background:
                              section === item.id
                                ? "var(--mantine-color-default-hover)"
                                : undefined,
                            padding: "5px 8px",
                            minHeight: 32,
                            fontWeight: section === item.id ? 600 : 400,
                          },
                          label: {
                            fontSize: "var(--mantine-font-size-sm)",
                            lineHeight: 1.3,
                          },
                        }}
                      />
                    </Box>
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
            style={{ width: 1, height: 1, overflow: "hidden", clip: "rect(0 0 0 0)" }}
          >
            現在の設定: {currentLabel}
          </Text>
        </Box>
      </AppShell.Main>
    </AppShell>
  )
}
