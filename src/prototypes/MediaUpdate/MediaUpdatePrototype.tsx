"use client"

import { Box, Button, Group, Modal, Stack, Text } from "@mantine/core"
import { IconTrash } from "@tabler/icons-react"
import { useState } from "react"
import { getApplicationNavigation } from "@/components/ApplicationShell"
import { FeedbackAlert } from "@/components/Feedback"
import { MediaTagBulkEditor, MediaTagEditorList, MediaTagEditorRow } from "@/components/MediaTagEditor"
import { PrototypeApplicationShell } from "@/prototypes/PrototypeApplicationShell"

export type MediaUpdateScenario = "editing" | "saving" | "saved" | "partial-failure" | "load-failure" | "leave-confirmation"

const contexts = {
  personal: { id: "personal", kind: "personal" as const, label: "Personal", accentColor: "var(--mantine-color-blue-6)" },
  community: { id: "community", kind: "community" as const, label: "家族のアルバム", accentColor: "var(--mantine-color-teal-6)" },
}

const initialItems = [
  { id: "1", label: "IMG_1842.HEIC", detail: "8.4 MB", tags: ["旅行", "夏"] },
  { id: "2", label: "IMG_1843.HEIC", detail: "7.9 MB", tags: ["旅行"] },
  { id: "3", label: "sunset.webp", detail: "3.1 MB", tags: ["家族"] },
]

export function MediaUpdatePrototype({
  scenario = "editing",
  context = "personal",
}: {
  scenario?: MediaUpdateScenario
  context?: "personal" | "community"
}) {
  const [items, setItems] = useState(initialItems)
  const [selectedIds, setSelectedIds] = useState(initialItems.map((item) => item.id))
  const [bulkTag, setBulkTag] = useState("")
  const currentContext = contexts[context]
  const unavailable = scenario === "partial-failure" ? new Set(["2"]) : new Set<string>()

  return <PrototypeApplicationShell
    currentContext={currentContext}
    contexts={Object.values(contexts)}
    navigationItems={getApplicationNavigation({ contextKind: currentContext.kind, activeSection: "media" })}
  >
    <Box maw={1120} mx="auto" w="100%" pb={88}>
      <Stack gap="lg">
        {scenario === "load-failure" ? <FeedbackAlert kind="error" title="Mediaを読み込めませんでした">
          編集対象を取得できません。再試行するかMedia Browserへ戻ってください。
        </FeedbackAlert> : <>
          {scenario === "saved" && <FeedbackAlert kind="success" title="変更を保存しました">すべてのMediaの変更が保存されました。</FeedbackAlert>}
          {scenario === "partial-failure" && <FeedbackAlert kind="warning" title="一部の変更を保存できませんでした">Media 2は現在編集できません。ほかのMediaの変更は保存されています。</FeedbackAlert>}
          <Stack gap="sm">
            <MediaTagBulkEditor
              selectedCount={selectedIds.length}
              allSelected={items.length > 0 && selectedIds.length === items.length}
              indeterminate={selectedIds.length > 0 && selectedIds.length !== items.length}
              selectionDisabled={items.length === 0}
              summaryItems={[
                { label: "Media登録済み", value: `${items.length}件` },
                { label: "画像処理中", value: "0件" },
                { label: "完了", value: `${items.length}件` },
              ]}
              value={bulkTag}
              actionDisabled={!bulkTag.trim() || selectedIds.length === 0}
              selectAllLabel="Mediaをすべて選択"
              headerAction={
                <Button
                  variant="subtle"
                  color="gray"
                  size="compact-sm"
                  disabled={items.length === 0}
                  aria-label="すべて削除"
                  onClick={() => {
                    setItems([])
                    setSelectedIds([])
                  }}
                >
                  <IconTrash size={16} />
                </Button>
              }
              onToggleAll={() => setSelectedIds(selectedIds.length === items.length ? [] : items.map((item) => item.id))}
              onChange={setBulkTag}
              onAction={(action) => {
                const tag = bulkTag.trim()
                if (!tag) return
                setItems((current) => current.map((item) => {
                  if (!selectedIds.includes(item.id) || unavailable.has(item.id)) return item
                  if (action === "replace") return { ...item, tags: [tag] }
                  if (action === "remove") return { ...item, tags: item.tags.filter((value) => value !== tag) }
                  return { ...item, tags: item.tags.includes(tag) ? item.tags : [...item.tags, tag] }
                }))
                setBulkTag("")
              }}
            />
            <MediaTagEditorList>
              {items.map((item) => (
                <MediaTagEditorRow
                  key={item.id}
                  label={item.label}
                  detail={item.detail}
                  tags={item.tags}
                  selected={selectedIds.includes(item.id)}
                  selectable={!unavailable.has(item.id)}
                  tagEditable={!unavailable.has(item.id)}
                  action={
                    <Button
                      variant="subtle"
                      color="gray"
                      size="compact-sm"
                      onClick={() => {
                        setItems((current) => current.filter((currentItem) => currentItem.id !== item.id))
                        setSelectedIds((current) => current.filter((id) => id !== item.id))
                      }}
                      aria-label={`${item.label}を削除`}
                    >
                      <IconTrash size={16} />
                    </Button>
                  }
                  onSelect={(checked) => setSelectedIds((current) =>
                    checked ? [...new Set([...current, item.id])] : current.filter((id) => id !== item.id)
                  )}
                  onTagsChange={(tags) => {
                    if (unavailable.has(item.id)) return
                    setItems((current) => current.map((currentItem) =>
                      currentItem.id === item.id ? { ...currentItem, tags } : currentItem
                    ))
                  }}
                />
              ))}
            </MediaTagEditorList>
          </Stack>
        </>}
      </Stack>
    </Box>

    <Box style={{ position: "fixed", left: 0, right: 0, bottom: 0, zIndex: 100, borderTop: "1px solid var(--mantine-color-default-border)", background: "var(--mantine-color-body)" }}>
      <Box maw={1120} mx="auto" px="lg" py="sm">
        <Group justify="flex-end">
          {scenario === "load-failure" ? <>
            <Button variant="default">Media Browserへ戻る</Button>
            <Button>再試行</Button>
          </> : <>
            <Button variant="default">キャンセル</Button>
            <Button loading={scenario === "saving"} disabled={scenario === "saved"}>{scenario === "saved" ? "保存済み" : "変更を保存"}</Button>
          </>}
        </Group>
      </Box>
    </Box>

    <Modal opened={scenario === "leave-confirmation"} onClose={() => undefined} title="編集画面を離れますか？" centered>
      <Stack>
        <Text size="sm">保存していないTagの変更があります。この画面を離れると変更は破棄されます。</Text>
        <Group justify="flex-end"><Button variant="default">この画面に残る</Button><Button color="red">変更を破棄して移動</Button></Group>
      </Stack>
    </Modal>
  </PrototypeApplicationShell>
}
