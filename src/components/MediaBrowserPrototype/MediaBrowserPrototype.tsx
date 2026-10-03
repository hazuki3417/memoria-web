"use client"

import {
  Alert, AspectRatio, Badge, Box, Button, Center, Checkbox, Group, Image,
  Loader, Menu, Modal, Paper, SegmentedControl, Select, Stack, TagsInput, Text, ThemeIcon,
} from "@mantine/core"
import {
  IconAlertCircle, IconCheckbox, IconChevronDown, IconCloudUpload,
  IconEye, IconFolderPlus, IconPhoto, IconPhotoOff, IconPlus, IconSearch,
  IconShare, IconTags, IconTrash,
} from "@tabler/icons-react"
import { useMediaQuery } from "@mantine/hooks"
import { useState } from "react"
import { ApplicationShell } from "@/components/ApplicationShell"
import { Dialog } from "@/components/Dialog"

type PrototypeState =
  | "default" | "tag-filtered" | "true-empty" | "filtered-empty" | "loading"
  | "error" | "loading-more" | "load-more-error" | "processing-failure" | "selection"
type ContextKind = "personal" | "community"
type SelectionDialog = "group" | "tag" | "share" | "delete" | null
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
        border: "1px solid var(--mantine-color-default-border)",
        outline: selected
          ? "2px solid var(--mantine-color-blue-6)"
          : "2px solid transparent",
        outlineOffset: "-2px",
        background: "var(--mantine-color-gray-0)",
        boxShadow: selected ? "0 0 0 2px var(--mantine-color-blue-light)" : undefined,
        cursor: "pointer",
        transition: "box-shadow 120ms ease, transform 120ms ease",
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
        <Checkbox
          checked={selected}
          readOnly
          size="sm"
          color="blue"
          aria-hidden="true"
          tabIndex={-1}
          styles={{
            input: {
              backgroundColor: selected ? undefined : "transparent",
              borderColor: selected ? undefined : "rgba(255, 255, 255, 0.92)",
              boxShadow: selected ? undefined : "0 1px 3px rgba(0, 0, 0, 0.45)",
            },
          }}
          style={{
            position: "absolute",
            top: 8,
            left: 8,
            pointerEvents: "none",
          }}
        />
      )}

    </Box>
  )
}

export function MediaBrowserPrototype({ initialState = "default", contextKind = "personal" }: {
  initialState?: PrototypeState; contextKind?: ContextKind
}) {
  const [context, setContext] = useState(contextKind)
  const compact = useMediaQuery("(max-width: 47.99em)")
  const [selecting, setSelecting] = useState(initialState === "selection")
  const [selected, setSelected] = useState<Set<string>>(initialState === "selection" ? new Set(["2", "5", "7"]) : new Set())
  const [detail, setDetail] = useState<MediaItem | null>(null)
  const [selectionDialog, setSelectionDialog] = useState<SelectionDialog>(null)
  const [groupTarget, setGroupTarget] = useState<string | null>(null)
  const [tagTarget, setTagTarget] = useState<string | null>(null)
  const [communityTarget, setCommunityTarget] = useState<string | null>(null)
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
      <Stack gap="xs" maw={1440} mx="auto">
        <Box
          style={{
            display: "grid",
            gridTemplateColumns: compact ? "minmax(0, 1fr)" : "minmax(0, 1fr) auto minmax(0, 1fr)",
            alignItems: "center",
            gap: "var(--mantine-spacing-xs)",
          }}
        >
          <Box style={{ minWidth: 0 }}>
            {!selecting ? (
              <Group gap="xs" wrap="nowrap">
                <TagsInput
                  placeholder="Tag"
                  data={["家族", "旅行", "風景", "イベント"]}
                  value={tags}
                  onChange={setTags}
                  clearable
                  leftSection={<IconSearch size={16} />}
                  size="xs"
                  w={compact ? "100%" : 280}
                  maw="100%"
                  style={{ flex: compact ? "1 1 auto" : undefined }}
                />
                <Button size="xs" style={{ flexShrink: 0 }}>検索</Button>
              </Group>
            ) : (
              <Badge size="lg" variant="light">{selected.size}件選択</Badge>
            )}
          </Box>

          {!compact && <Box />}

          <Group gap="xs" justify="flex-end" wrap="nowrap" style={{ gridColumn: compact ? "1" : undefined }}>
            {selecting && (
              <>
                <Button size="xs" variant="default" leftSection={<IconFolderPlus size={15} />} disabled={selected.size === 0} onClick={() => setSelectionDialog("group")}>Group</Button>
                <Button size="xs" variant="default" leftSection={<IconTags size={15} />} disabled={selected.size === 0} onClick={() => setSelectionDialog("tag")}>Tag</Button>
                {context === "personal" && (
                  <Button size="xs" variant="default" leftSection={<IconShare size={15} />} disabled={selected.size === 0} onClick={() => setSelectionDialog("share")}>共有</Button>
                )}
                <Button size="xs" variant="default" color="red" leftSection={<IconTrash size={15} />} disabled={selected.size === 0} onClick={() => setSelectionDialog("delete")}>削除</Button>
              </>
            )}
            {!selecting && (context === "personal" ? (
              <Button size="xs" leftSection={<IconCloudUpload size={16} />}>アップロード</Button>
            ) : (
              <Menu position="bottom-end">
                <Menu.Target>
                  <Button size="xs" rightSection={<IconChevronDown size={14} />} leftSection={<IconPlus size={16} />}>
                    Mediaを追加
                  </Button>
                </Menu.Target>
                <Menu.Dropdown>
                  <Menu.Item leftSection={<IconCloudUpload size={16} />}>Communityへアップロード</Menu.Item>
                  <Menu.Item leftSection={<IconShare size={16} />}>Personal Mediaから共有</Menu.Item>
                </Menu.Dropdown>
              </Menu>
            ))}
            <SegmentedControl
              size="xs"
              value={selecting ? "select" : "view"}
              onChange={(value) => {
                if (value === "select") {
                  setSelecting(true)
                  return
                }
                endSelection()
              }}
              data={[
                {
                  value: "view",
                  label: <Center style={{ gap: 6 }}><IconEye size={15} /><span>View</span></Center>,
                },
                {
                  value: "select",
                  label: <Center style={{ gap: 6 }}><IconCheckbox size={15} /><span>Select</span></Center>,
                },
              ]}
            />
          </Group>
        </Box>

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

      <Dialog
        opened={selectionDialog === "group"}
        onClose={() => setSelectionDialog(null)}
        title="Groupに追加"
        size="md"
        footer={
          <Dialog.Footer
            secondary={<Button variant="default" onClick={() => setSelectionDialog(null)}>キャンセル</Button>}
            primary={<Button disabled={!groupTarget} onClick={() => setSelectionDialog(null)}>追加</Button>}
          />
        }
      >
        <Stack gap="xs">
          <Text size="sm">{selected.size}件のMediaを既存のGroupに追加します。</Text>
          <Select
            label="Group"
            placeholder="Groupを選択"
            searchable
            data={["旅行", "家族", "風景写真", "お気に入り"]}
            value={groupTarget}
            onChange={setGroupTarget}
          />
        </Stack>
      </Dialog>

      <Dialog
        opened={selectionDialog === "tag"}
        onClose={() => setSelectionDialog(null)}
        title="Tagを追加"
        size="md"
        footer={
          <Dialog.Footer
            secondary={<Button variant="default" onClick={() => setSelectionDialog(null)}>キャンセル</Button>}
            primary={<Button disabled={!tagTarget} onClick={() => setSelectionDialog(null)}>追加</Button>}
          />
        }
      >
        <Stack gap="xs">
          <Text size="sm">{selected.size}件のMediaにTagを追加します。</Text>
          <Select
            label="Tag"
            placeholder="Tagを選択"
            searchable
            data={["家族", "旅行", "風景", "イベント"]}
            value={tagTarget}
            onChange={setTagTarget}
          />
        </Stack>
      </Dialog>

      <Dialog
        opened={selectionDialog === "share"}
        onClose={() => setSelectionDialog(null)}
        title="Communityへ共有"
        size="md"
        footer={
          <Dialog.Footer
            secondary={<Button variant="default" onClick={() => setSelectionDialog(null)}>キャンセル</Button>}
            primary={<Button disabled={!communityTarget} onClick={() => setSelectionDialog(null)}>共有</Button>}
          />
        }
      >
        <Stack gap="xs">
          <Text size="sm">{selected.size}件のPersonal MediaをCommunityへ共有します。</Text>
          <Select
            label="Community"
            placeholder="Communityを選択"
            data={["Photo Club", "Family Archive", "Travel Team"]}
            value={communityTarget}
            onChange={setCommunityTarget}
          />
        </Stack>
      </Dialog>

      <Dialog
        opened={selectionDialog === "delete"}
        onClose={() => setSelectionDialog(null)}
        title="Mediaを削除"
        size="md"
        footer={
          <Dialog.Footer
            secondary={<Button variant="default" onClick={() => setSelectionDialog(null)}>キャンセル</Button>}
            primary={<Button color="red" onClick={() => setSelectionDialog(null)}>削除</Button>}
          />
        }
      >
        <Text size="sm">
          選択した{selected.size}件のMediaを削除します。この操作は元に戻せません。
        </Text>
      </Dialog>

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
