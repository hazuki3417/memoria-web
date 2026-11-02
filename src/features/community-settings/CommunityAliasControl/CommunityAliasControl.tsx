"use client"

import { Alert, Box, Button, Stack, TextInput } from "@mantine/core"
import { useEffect, useRef, useState } from "react"
import { useController, useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import type { z } from "zod"
import { communityAliasSchema } from "../communityAliasSchema"
import { showNotification } from "@/components/Feedback"

export function CommunityAliasControl({
  savedAlias,
  onSave,
}: {
  savedAlias: string | null
  onSave: (alias: string | null) => Promise<void>
}) {
  const { control, getValues, reset, handleSubmit } = useForm<
    z.input<typeof communityAliasSchema>,
    unknown,
    z.output<typeof communityAliasSchema>
  >({
    resolver: zodResolver(communityAliasSchema),
    mode: "onChange",
    defaultValues: { alias: savedAlias ?? "" },
  })
  const { field } = useController({ control, name: "alias" })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(false)
  // Compare the current draft to the last source value, not a sticky "edited" flag.
  const previousAlias = useRef(savedAlias ?? "")
  useEffect(() => {
    const sourceAlias = savedAlias ?? ""
    if (previousAlias.current === sourceAlias) return
    const draftIsEdited = getValues("alias").trim() !== previousAlias.current
    previousAlias.current = sourceAlias
    if (!draftIsEdited && !saving) reset({ alias: sourceAlias })
  }, [savedAlias, getValues, reset, saving])
  const text = field.value
  const normalized = text.trim()
  const validation = communityAliasSchema.safeParse({ alias: text })
  const changed = normalized !== (savedAlias ?? "")
  const invalid = !validation.success

  const save = handleSubmit(async ({ alias }) => {
    if (saving || !changed) return
    setSaving(true)
    setError(false)
    try {
      await onSave(alias)
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
  })

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
          field.onChange(event.currentTarget.value)
          setError(false)
        }}
        error={
          !validation.success ? validation.error.issues[0]?.message : undefined
        }
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
