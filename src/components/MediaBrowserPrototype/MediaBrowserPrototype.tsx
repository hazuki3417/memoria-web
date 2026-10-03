"use client"

import {
  Alert, AspectRatio, Badge, Box, Button, Center, Group, Loader, Menu, Modal,
  Image, Paper, Stack, TagsInput, Text, ThemeIcon,
} from "@mantine/core"
import {
  IconAlertCircle, IconCheck, IconChevronDown, IconCloudUpload, IconFolderPlus,
  IconPhoto, IconPhotoOff, IconPlus, IconShare, IconTags, IconTrash, IconX,
} from "@tabler/icons-react"
import { useState } from "react"
import { ApplicationShell } from "@/components/ApplicationShell"
import { PageHeader } from "@/components/PageHeader"

type PrototypeState =
  | "default" | "tag-filtered" | "true-empty" | "filtered-empty" | "loading"
  | "error" | "loading-more" | "load-more-error" | "processing-failure" | "selection"
type ContextKind = "personal" | "community"
type MediaItem = { id: string; label: string; src: string; failed?: boolean }

const media: MediaItem[] = Array.from({ length: 8 }, (_, index) => ({
  id: String(index + 1),
  label: `Media ${index + 1}`,
  src: `/group-browser/group-media-${String((index % 9) + 1).padStart(2, "0")}.jpg`,
}))
media.push({ id: "9", label: "画像処理失敗", src: "", failed: true })
const contexts = [
  { id: "personal", kind: "personal" as const, label: "Personal", accentColor: "var(--mantine-color-blue-6)" },
  { id: "community", kind: "community" as const, label: "Photo Club", accentColor: "var(--mantine-color-violet-6)" },
]
const navigationItems = [
  { id: "media", label: "Media", icon: IconPhoto, active: true },
  { id: "groups", label: "Groups", icon: IconFolderPlus },
]

function MediaTile({ item, selecting, selected, onClick }: {
  item: MediaItem; selecting: boolean; selected: boolean; onClick: () => void
}) {
  return (
    <Box
      component="button"
      type="button"
      onClick={onClick}
      aria-label={selecting ? `${item.label}を${selected ? "選択解除" : "選択"}` : `${item.label}を開く`}
      aria-pressed={selecting ? selected : undefined}
      w="100%"
      p={0}
      bdrs="md"
      style={{
        position: "relative",
        aspectRatio: "1 / 1",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        overflow: "hidden",
        border: selected
          ? "2px solid var(--mantine-color-blue-6)"
          : "1px solid var(--mantine-color-default-border)",
        background: "var(--mantine-color-gray-0)",
        boxShadow: selected ? "0 0 0 2px var(--mantine-color-blue-light)" : undefined,
        cursor: "pointer",
        transition: "border-color 120ms ease, box-shadow 120ms ease, transform 120ms ease",
        userSelect: "none",
      }}
    >
      {item.failed ? (
        <Stack align="center" justify="center" gap={6} p="sm" c="dimmed">
          <IconPhotoOff size={30} stroke={1.5} aria-hidden="true" />
          <Text size="xs" fw={600} ta="center">画像を表示できません</Text>
          <Text size="10px" ta="center">処理に失敗しました</Text>
        </Stack>
      ) : (
        <Image
          src={item.src}
          alt={item.label}
          w="100%"
          h="100%"
          fit="cover"
          draggable={false}
        />
      )}

      {selecting && (
        <Box
          aria-hidden="true"
          style={{
            position: "absolute",
            inset: 0,
            background: selected ? "rgba(34, 139, 230, 0.08)" : "transparent",
          }}
        />
      )}

      {selecting && (
        <ThemeIcon
          radius="xl"
          size={26}
          variant={selected ? "filled" : "white"}
          color={selected ? "blue" : "gray"}
          style={{
            position: "absolute",
            top: 8,
            right: 8,
            border: selected ? undefined : "1px solid var(--mantine-color-gray-4)",
            boxShadow: "var(--mantine-shadow-xs)",
          }}
          aria-hidden="true"
        >
          {selected && <IconCheck size={16} />}
        </ThemeIcon>
      )}
    </Box>
  )
}

export function MediaBrowserPrototype({ initialState = "default", contextKind = "personal" }: {
  initialState?: PrototypeState; contextKind?: ContextKind
}) {
  const [context, setContext] = useState(contextKind)
  const [selecting, setSelecting] = useState(initialState === "selection")
  const [selected, setSelected] = useState<Set<string>>(initialState === "selection" ? new Set(["2", "5", "7"]) : new Set())
  const [detail, setDetail] = useState<MediaItem | null>(null)
  const [tags, setTags] = useState<string[]>(initialState === "tag-filtered" || initialState === "filtered-empty" ? ["旅行"] : [])
  const currentContext = contexts.find((item) => item.kind === context) ?? contexts[0]
  const stateItems =
    ["true-empty", "filtered-empty", "loading", "error"].includes(initialState) ? []
      : initialState === "processing-failure" ? [...media.slice(0, 5), media[8]] : media.slice(0, 8)

  const toggle = (id: string) => setSelected((current) => {
    const next = new Set(current)
    if (next.has(id)) next.delete(id)
    else next.add(id)
    return next
  })
  const endSelection = () => { setSelected(new Set()); setSelecting(false) }

  return (
    <ApplicationShell currentContext={currentContext} contexts={contexts} navigationItems={navigationItems}
      user={{ displayName: "Hazuki" }}
      onSelectContext={(id) => setContext(id === "community" ? "community" : "personal")}
      onSelectNavigation={() => {}} onCreateCommunity={() => {}} onOpenSettings={() => {}} onLogout={() => {}}>
      <Stack gap="lg" maw={1440} mx="auto">
        <PageHeader title="Media"
          description={context === "personal" ? "あなたのMediaを閲覧・整理します。" : "Photo Clubで共有されているMediaを閲覧・整理します。"} />

        <Paper withBorder radius="md" p="sm">
          {selecting ? (
            <Group justify="space-between" gap="sm">
              <Group gap="xs">
                <Badge size="lg" variant="light">{selected.size}件選択</Badge>
                <Text size="xs" c="dimmed" visibleFrom="sm">選択中はTag filterを変更できません</Text>
              </Group>
              <Group gap={6}>
                <Button size="xs" variant="default" leftSection={<IconFolderPlus size={15} />}>Group</Button>
                <Button size="xs" variant="default" leftSection={<IconTags size={15} />}>Tag</Button>
                {context === "personal" && <Button size="xs" variant="default" leftSection={<IconShare size={15} />}>共有</Button>}
                <Button size="xs" variant="default" color="red" leftSection={<IconTrash size={15} />}>削除</Button>
                <Button size="xs" variant="subtle" color="gray" leftSection={<IconX size={15} />} onClick={endSelection}>選択を終了</Button>
              </Group>
            </Group>
          ) : (
            <Group justify="space-between" align="flex-end" gap="sm">
              <TagsInput label="Tagで絞り込み" placeholder="Tagを選択" data={["家族", "旅行", "風景", "イベント"]}
                value={tags} onChange={setTags} clearable w={{ base: "100%", sm: 320 }} />
              <Group gap="xs">
                <Button variant="default" onClick={() => setSelecting(true)}>選択</Button>
                {context === "personal" ? (
                  <Button leftSection={<IconCloudUpload size={16} />}>アップロード</Button>
                ) : (
                  <Menu position="bottom-end">
                    <Menu.Target>
                      <Button rightSection={<IconChevronDown size={14} />} leftSection={<IconPlus size={16} />}>Mediaを追加</Button>
                    </Menu.Target>
                    <Menu.Dropdown>
                      <Menu.Item leftSection={<IconCloudUpload size={16} />}>Communityへアップロード</Menu.Item>
                      <Menu.Item leftSection={<IconShare size={16} />}>Personal Mediaから共有</Menu.Item>
                    </Menu.Dropdown>
                  </Menu>
                )}
              </Group>
            </Group>
          )}
        </Paper>

        {initialState === "loading" && (
          <Center mih={360}><Stack align="center"><Loader /><Text size="sm" c="dimmed">Mediaを読み込んでいます</Text></Stack></Center>
        )}
        {initialState === "error" && (
          <Alert icon={<IconAlertCircle size={18} />} title="Mediaを読み込めませんでした" color="red">
            <Group justify="space-between"><Text size="sm">通信状態を確認して、もう一度お試しください。</Text><Button size="xs" variant="default">再試行</Button></Group>
          </Alert>
        )}
        {initialState === "true-empty" && (
          <Center mih={360}><Stack align="center" maw={420}>
            <ThemeIcon size={48} radius="xl" variant="light"><IconPhoto size={24} /></ThemeIcon>
            <Text fw={700} size="lg">まだMediaがありません</Text>
            <Text size="sm" c="dimmed" ta="center">
              {context === "personal" ? "最初のMediaをアップロードすると、ここから閲覧・整理できます。" : "CommunityへMediaを追加すると、ここから閲覧・整理できます。"}
            </Text>
            <Button leftSection={<IconCloudUpload size={16} />}>{context === "personal" ? "Mediaをアップロード" : "Mediaを追加"}</Button>
          </Stack></Center>
        )}
        {initialState === "filtered-empty" && (
          <Center mih={360}><Stack align="center" maw={420}>
            <ThemeIcon size={48} radius="xl" variant="light" color="gray"><IconTags size={24} /></ThemeIcon>
            <Text fw={700} size="lg">一致するMediaがありません</Text>
            <Text size="sm" c="dimmed" ta="center">選択中のTagを変更するか、filterを解除してください。</Text>
            <Button variant="default" onClick={() => setTags([])}>Filterを解除</Button>
          </Stack></Center>
        )}

        {stateItems.length > 0 && (
          <Box
            p={3}
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(min(168px, 100%), 1fr))",
              gap: "var(--mantine-spacing-xs)",
            }}
          >
            {stateItems.map((item) => (
              <MediaTile
                key={item.id}
                item={item}
                selecting={selecting}
                selected={selected.has(item.id)}
                onClick={() => selecting ? toggle(item.id) : setDetail(item)}
              />
            ))}
          </Box>
        )}
        {initialState === "loading-more" && (
          <Center py="md"><Group gap="xs"><Loader size="sm" /><Text size="sm" c="dimmed">さらに読み込んでいます</Text></Group></Center>
        )}
        {initialState === "load-more-error" && (
          <Paper withBorder radius="md" p="sm"><Group justify="space-between">
            <Group gap="xs"><IconAlertCircle size={18} /><Text size="sm">続きのMediaを読み込めませんでした</Text></Group>
            <Button size="xs" variant="default">再試行</Button>
          </Group></Paper>
        )}
      </Stack>

      <Modal opened={detail !== null} onClose={() => setDetail(null)} title="Media Detail" size="xl" centered>
        {detail && <Stack>
          <AspectRatio ratio={16 / 10} style={{ borderRadius: "var(--mantine-radius-md)", overflow: "hidden" }}>
            <Image src={detail.src} alt={detail.label} fit="contain" />
          </AspectRatio>
          <Box>
            <Text fw={650}>{detail.label}</Text>
            <Text size="xs" c="dimmed">IMG_20261003_0842.jpg · 4032 × 3024</Text>
          </Box>
        </Stack>}
      </Modal>
    </ApplicationShell>
  )
}
