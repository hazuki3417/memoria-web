"use client"

import { Box, Button, Group, Modal, Stack, Text } from "@mantine/core"
import { useState } from "react"
import { getApplicationNavigation } from "@/components/ApplicationShell"
import { FeedbackAlert } from "@/components/Feedback"
import { MediaTagEditor, type MediaTagEditorItem } from "@/components/MediaTagEditor"
import { PrototypeApplicationShell } from "@/prototypes/PrototypeApplicationShell"

export type MediaUpdateScenario = "editing" | "saving" | "saved" | "partial-failure" | "load-failure" | "leave-confirmation"

const contexts = {
  personal: { id: "personal", kind: "personal" as const, label: "Personal", accentColor: "var(--mantine-color-blue-6)" },
  community: { id: "community", kind: "community" as const, label: "家族のアルバム", accentColor: "var(--mantine-color-teal-6)" },
}

const initialItems: MediaTagEditorItem[] = [
  { id: "1", label: "Media 1", tags: ["旅行", "夏"] },
  { id: "2", label: "Media 2", tags: ["旅行"] },
  { id: "3", label: "Media 3", tags: ["家族"] },
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
  const currentContext = contexts[context]
  const unavailable = scenario === "partial-failure" ? new Set(["2"]) : new Set<string>()

  return <PrototypeApplicationShell
    currentContext={currentContext}
    contexts={Object.values(contexts)}
    navigationItems={getApplicationNavigation({ contextKind: currentContext.kind, activeSection: "media" })}
  >
    <Box maw={1120} mx="auto" w="100%" pb={88}>
      <Stack gap="lg">
        <Box>
          <Text size="xl" fw={700}>Mediaを編集</Text>
          <Text size="sm" c="dimmed" mt={4}>{items.length}件のMediaのTagを編集します</Text>
        </Box>

        {scenario === "load-failure" ? <FeedbackAlert kind="error" title="Mediaを読み込めませんでした">
          編集対象を取得できません。再試行するかMedia Browserへ戻ってください。
        </FeedbackAlert> : <>
          {scenario === "saved" && <FeedbackAlert kind="success" title="変更を保存しました">すべてのMediaの変更が保存されました。</FeedbackAlert>}
          {scenario === "partial-failure" && <FeedbackAlert kind="warning" title="一部の変更を保存できませんでした">Media 2は現在編集できません。ほかのMediaの変更は保存されています。</FeedbackAlert>}
          <MediaTagEditor
            items={items}
            selectedIds={selectedIds}
            onSelectedIdsChange={setSelectedIds}
            onTagsChange={(id, tags) => {
              if (unavailable.has(id)) return
              setItems((current) => current.map((item) => item.id === id ? { ...item, tags } : item))
            }}
          />
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
