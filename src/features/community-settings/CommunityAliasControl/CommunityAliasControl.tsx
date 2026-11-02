"use client"

import { Alert, Box, Button, Stack, TextInput } from "@mantine/core"
import { useEffect, useRef, useState } from "react"
import { useController, useForm } from "react-hook-form"
import { showNotification } from "@/components/Feedback"

export function CommunityAliasControl({
  savedAlias,
  onSave,
}: {
  savedAlias: string | null
  onSave: (alias: string | null) => Promise<void>
}) {
  const { control, reset } = useForm<{ alias: string }>({
    defaultValues: { alias: savedAlias ?? "" },
  })
  const { field } = useController({ control, name: "alias" })
  // A draft is independent of Apollo refreshes until it is saved.
  const editing = useRef(false)
  useEffect(() => {
    if (!editing.current) reset({ alias: savedAlias ?? "" })
  }, [savedAlias, reset])
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(false)
  const text = field.value
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
      editing.current = false
      reset({ alias: normalized })
      showNotification({
        kind: "success",
        title: "Community別名を保存",
        description: normalized
          ? "別名を変更しました。"
          : "別名を解除しました。",
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
        label="Community別名"
        description="自分だけに表示される名前です。空欄で保存すると正式名称が表示されます。"
        aria-label="Community別名"
        placeholder="別名を入力"
        name={field.name}
        ref={field.ref}
        onBlur={field.onBlur}
        value={text}
        disabled={saving}
        onChange={(event) => {
          editing.current = true
          field.onChange(event.currentTarget.value)
          setError(false)
        }}
        error={invalid ? "100文字以内で入力してください。" : undefined}
      />
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
