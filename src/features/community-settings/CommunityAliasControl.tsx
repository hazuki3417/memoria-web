"use client"

import { Alert, Box, Button, Stack, Text, TextInput } from "@mantine/core"
import { useState } from "react"
import { showNotification } from "@/components/Feedback"

export function CommunityAliasControl({
  savedAlias,
  onSave,
}: {
  savedAlias: string | null
  onSave: (alias: string | null) => Promise<void>
}) {
  const [draft, setDraft] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(false)
  const text = draft ?? savedAlias ?? ""
  const normalized = text.trim()
  const codepoints = Array.from(normalized).length
  const changed = normalized !== (savedAlias ?? "")
  const invalid = codepoints > 100

  const save = async () => {
    if (saving || !changed || invalid) return
    setSaving(true)
    setError(false)
    try {
      await onSave(normalized || null)
      setDraft(null)
      showNotification({
        kind: "success",
        title: "Community別名を保存",
        description: normalized ? "別名を変更しました。" : "別名を解除しました。",
      })
    } catch {
      // 未保存のDraftを保持し、再試行可能にする。
      setError(true)
    } finally {
      setSaving(false)
    }
  }

  return (
    <Stack gap="md" maw={540}>
      <TextInput
        label="Community別名（任意）"
        description="自分だけに表示される名前です。空欄で保存すると正式名称が表示されます。"
        aria-label="Community別名"
        placeholder="別名を入力"
        value={text}
        disabled={saving}
        onChange={(event) => {
          setDraft(event.currentTarget.value)
          setError(false)
        }}
        error={invalid ? "100文字以内で入力してください。" : undefined}
      />
      {changed && !invalid && (
        <Text size="xs" c="dimmed">未保存の変更があります。</Text>
      )}
      {error && (
        <Alert color="red" title="保存できませんでした">
          入力内容を保持しています。再度保存してください。
        </Alert>
      )}
      <Box>
        <Button
          size="sm"
          loading={saving}
          disabled={!changed || invalid}
          onClick={() => void save()}
        >
          保存
        </Button>
      </Box>
    </Stack>
  )
}
