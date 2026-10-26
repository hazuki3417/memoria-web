"use client"

import { useRouter } from "next/navigation"

import { Box, Button, Group, Modal, Stack, Text } from "@mantine/core"
import { IconTrash } from "@tabler/icons-react"
import { useEffect, useState } from "react"
import { useMediaUpdateDraft, type MediaUpdateDraftItem } from "./useMediaUpdateDraft"
import type { MediaUpdateScope } from "./mediaTagApi"

import { FeedbackAlert } from "@/components/Feedback"
import { applyMediaTagDraftAction } from "@/components/MediaTagEditor/mediaTagDraft"
import {
  MediaTagBulkEditor,
  MediaTagEditorList,
  MediaTagEditorRow,
} from "@/components/MediaTagEditor"

export type MediaUpdateScenario =
  | "editing"
  | "saving"
  | "saved"
  | "partial-failure"
  | "load-failure"
  | "leave-confirmation"

const contexts = {
  personal: {
    id: "personal",
    kind: "personal" as const,
    label: "Personal",
    accentColor: "var(--mantine-color-blue-6)",
  },
  community: {
    id: "community",
    kind: "community" as const,
    label: "家族のアルバム",
    accentColor: "var(--mantine-color-teal-6)",
  },
}

const initialItems = [
  { id: "1", label: "Media 1", detail: "", tags: ["旅行", "夏"] },
  { id: "2", label: "Media 2", detail: "", tags: ["旅行"] },
  { id: "3", label: "Media 3", detail: "", tags: ["家族"] },
]

type LiveProps = {
 items: MediaUpdateDraftItem[]
 status: "idle" | "loading" | "saving" | "saved" | "partial-failure" | "load-failure"
 changed: boolean
 onChangeTags: (id: string, tags: string[]) => void
 onDiscard: (id: string) => void
 onSave: () => void
 onReload: () => void
}

export function MediaUpdateLive({
 targets,
 context = "personal",
 communityId = "photo-club",
}: {
 targets: { id: string; label: string; detail: string }[]
 context?: "personal" | "community"
 communityId?: string
}) {
 const scope: MediaUpdateScope = context === "personal"
  ? { type: "PERSONAL" }
  : { type: "COMMUNITY", communityId }
 const draft = useMediaUpdateDraft(targets, scope)
 return <MediaUpdate context={context} communityId={communityId} live={{
  items: draft.items, status: draft.status, changed: draft.changed,
  onChangeTags: draft.updateTags, onDiscard: draft.discard,
  onSave: () => { void draft.save() },
  onReload: () => { void draft.reload() },
 }} />
}

export function MediaUpdate({
  scenario = "editing",
  context = "personal",
  communityId = "photo-club",
  live,
}: {
  live?: LiveProps
  scenario?: MediaUpdateScenario
  context?: "personal" | "community"
  communityId?: string
}) {
  const router = useRouter()
  const [items, setItems] = useState(initialItems)
  const [selectedIds, setSelectedIds] = useState(
    initialItems.map((item) => item.id),
  )
  const [bulkTag, setBulkTag] = useState("")
  const [leavePrompt, setLeavePrompt] = useState(false)
  const backToBrowser = () => router.push(context === "community" ? `/communities/${communityId}/media` : "/media")
  useEffect(() => {
    if (live) setSelectedIds(live.items.map((item) => item.id))
  // Sync selection when loaded Media identifiers change.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [live?.items.map((item) => item.id).join(",")])
  const shownItems = live?.items ?? items
  const shownScenario = live ? (live.status === "idle" || live.status === "loading" ? "editing" : live.status) : scenario
  const currentContext = contexts[context]
  const unavailable =
    !live && shownScenario === "partial-failure" ? new Set(["2"]) : new Set<string>()

  return (
    <>
      <Box maw={1120} mx="auto" w="100%" pb={88}>
        <Stack gap="lg">
          {shownScenario === "load-failure" ? (
            <FeedbackAlert kind="error" title="Mediaを読み込めませんでした">
              編集対象を取得できません。再試行するかMedia
              Browserへ戻ってください。
            </FeedbackAlert>
          ) : (
            <>
              {shownScenario === "saved" && (
                <FeedbackAlert kind="success" title="変更を保存しました">
                  すべてのMediaの変更が保存されました。
                </FeedbackAlert>
              )}
              {shownScenario === "partial-failure" && (
                <FeedbackAlert
                  kind="warning"
                  title="一部の変更を保存できませんでした"
                >
                  {live ? "一部のMediaの変更を保存できませんでした。未保存の内容を確認して再試行してください。" : "Media 2は現在編集できません。ほかのMediaの変更は保存されています。"}
                </FeedbackAlert>
              )}
              <Stack gap="sm">
                <MediaTagBulkEditor
                  selectedCount={selectedIds.length}
                  allSelected={
                    shownItems.length > 0 && selectedIds.length === shownItems.length
                  }
                  indeterminate={
                    selectedIds.length > 0 &&
                    selectedIds.length !== shownItems.length
                  }
                  selectionDisabled={shownItems.length === 0 || live?.status === "loading" || live?.status === "saving"}
                  summaryItems={[
                    { label: "Media登録済み", value: `${shownItems.length}件` },
                    { label: "画像処理中", value: "0件" },
                    { label: "完了", value: `${shownItems.length}件` },
                  ]}
                  value={bulkTag}
                  actionDisabled={!bulkTag.trim() || selectedIds.length === 0 || live?.status === "loading" || live?.status === "saving"}
                  selectAllLabel="Mediaをすべて選択"
                  headerAction={
                    <Button
                      variant="subtle"
                      color="gray"
                      size="compact-sm"
                      disabled={shownItems.length === 0}
                      aria-label="すべて削除"
                      onClick={() => {
                        if (live) { shownItems.forEach((item) => live.onDiscard(item.id)) } else setItems([])
                        setSelectedIds([])
                      }}
                    >
                      <IconTrash size={16} />
                    </Button>
                  }
                  onToggleAll={() =>
                    setSelectedIds(
                      selectedIds.length === shownItems.length
                        ? []
                        : shownItems.map((item) => item.id),
                    )
                  }
                  onChange={setBulkTag}
                  onAction={(action) => {
                    const tag = bulkTag.trim()
                    if (!tag) return
                    if (live) {
                      shownItems.forEach((item) => {
                        if (selectedIds.includes(item.id) && !unavailable.has(item.id)) {
                          live.onChangeTags(item.id, applyMediaTagDraftAction(item.tags, tag, action))
                        }
                      })
                    } else setItems((current) =>
                      current.map((item) => {
                        if (
                          !selectedIds.includes(item.id) ||
                          unavailable.has(item.id)
                        )
                          return item
                        return {
                          ...item,
                          tags: applyMediaTagDraftAction(item.tags, tag, action),
                        }
                      }),
                    )
                    setBulkTag("")
                  }}
                />
                <MediaTagEditorList>
                  {shownItems.map((item) => (
                    <MediaTagEditorRow
                      key={item.id}
                      label={item.label}
                      detail={item.detail}
                      tags={item.tags}
                      selected={selectedIds.includes(item.id)}
                      selectable={!unavailable.has(item.id) && live?.status !== "loading" && live?.status !== "saving"}
                      tagEditable={!unavailable.has(item.id) && live?.status !== "loading" && live?.status !== "saving"}
                      action={
                        <Button
                          variant="subtle"
                          color="gray"
                          size="compact-sm"
                          onClick={() => {
                            if (live) live.onDiscard(item.id)
                            else setItems((current) =>
                              current.filter(
                                (currentItem) => currentItem.id !== item.id,
                              ),
                            )
                            setSelectedIds((current) =>
                              current.filter((id) => id !== item.id),
                            )
                          }}
                          aria-label={`${item.label}を削除`}
                        >
                          <IconTrash size={16} />
                        </Button>
                      }
                      onSelect={(checked) =>
                        setSelectedIds((current) =>
                          checked
                            ? [...new Set([...current, item.id])]
                            : current.filter((id) => id !== item.id),
                        )
                      }
                      onTagsChange={(tags) => {
                        if (unavailable.has(item.id)) return
                        if (live) live.onChangeTags(item.id, tags)
                        else setItems((current) =>
                          current.map((currentItem) =>
                            currentItem.id === item.id
                              ? { ...currentItem, tags }
                              : currentItem,
                          ),
                        )
                      }}
                    />
                  ))}
                </MediaTagEditorList>
              </Stack>
            </>
          )}
        </Stack>
      </Box>

      <Box
        style={{
          position: "fixed",
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: 100,
          borderTop: "1px solid var(--mantine-color-default-border)",
          background: "var(--mantine-color-body)",
        }}
      >
        <Box maw={1120} mx="auto" px="lg" py="sm">
          <Group justify="flex-end">
            {shownScenario === "load-failure" ? (
              <>
                <Button
                  variant="default"
                  onClick={() =>
                    router.push(
                      context === "community"
                        ? `/communities/${communityId}/media`
                        : "/media",
                    )
                  }
                >
                  Media Browserへ戻る
                </Button>
                <Button onClick={live?.onReload}>再試行</Button>
              </>
            ) : (
              <>
                <Button variant="default" onClick={() => live?.changed ? setLeavePrompt(true) : backToBrowser()}>キャンセル</Button>
                <Button
                  loading={shownScenario === "saving"}
                  disabled={shownScenario === "saved" || (live ? (!live.changed || live.status === "loading") : false)}
                  onClick={live?.onSave}
                >
                  {shownScenario === "saved" ? "保存済み" : "変更を保存"}
                </Button>
              </>
            )}
          </Group>
        </Box>
      </Box>

      <Modal
        opened={scenario === "leave-confirmation" || leavePrompt}
        onClose={() => setLeavePrompt(false)}
        title="編集画面を離れますか？"
        centered
      >
        <Stack>
          <Text size="sm">
            保存していないTagの変更があります。この画面を離れると変更は破棄されます。
          </Text>
          <Group justify="flex-end">
            <Button variant="default" onClick={() => setLeavePrompt(false)}>この画面に残る</Button>
            <Button color="red" onClick={backToBrowser}>変更を破棄して移動</Button>
          </Group>
        </Stack>
      </Modal>
    </>
  )
}
