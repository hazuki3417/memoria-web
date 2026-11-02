"use client"

import { Alert, Box, Button, Stack, TextInput } from "@mantine/core"
import { useEffect, useRef, useState } from "react"
import { useController, useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import type { z } from "zod"
import { communityAliasSchema } from "../communityAliasSchema"
import { showNotification } from "@/components/Feedback"
import {
  SettingsInputValidationError,
  classifySettingsSaveFailure,
  resolveSettingsValidation,
  type SettingsSaveFailureKind,
} from "@/features/settings/graphqlSettingsResult"

export function CommunityAliasControl({
  savedAlias,
  onSave,
}: {
  savedAlias: string | null
  onSave: (alias: string | null) => Promise<void>
}) {
  const { control, getValues, reset, handleSubmit, setError, clearErrors } = useForm<
    z.input<typeof communityAliasSchema>,
    unknown,
    z.output<typeof communityAliasSchema>
  >({
    resolver: zodResolver(communityAliasSchema),
    mode: "onChange",
    defaultValues: { alias: savedAlias ?? "" },
  })
  const { field, fieldState } = useController({ control, name: "alias" })
  const [saving, setSaving] = useState(false)
  const [failure, setFailure] = useState<SettingsSaveFailureKind | null>(null)
  const [formInvalid, setFormInvalid] = useState(false)
  // Compare the current draft to the last source value, not a sticky "edited" flag.
  const previousSourceAlias = useRef(savedAlias ?? "")
  // A confirmed save can precede the refreshed savedAlias prop.
  const savedBaseline = useRef(savedAlias ?? "")
  useEffect(() => {
    const sourceAlias = savedAlias ?? ""
    if (previousSourceAlias.current === sourceAlias) return
    const draftIsEdited = getValues("alias").trim() !== savedBaseline.current
    previousSourceAlias.current = sourceAlias
    savedBaseline.current = sourceAlias
    if (!draftIsEdited && !saving) reset({ alias: sourceAlias })
  }, [savedAlias, getValues, reset, saving])
  const text = field.value
  const normalized = text.trim()
  const validation = communityAliasSchema.safeParse({ alias: text })
  const changed = normalized !== savedBaseline.current
  const invalid = !validation.success

  const save = handleSubmit(async ({ alias }) => {
    if (saving || !changed) return
    setSaving(true)
    setFailure(null)
    setFormInvalid(false)
    clearErrors("alias")
    try {
      await onSave(alias)
      savedBaseline.current = normalized
      reset({ alias: normalized })
      showNotification({
        kind: "success",
        title: "Community別名を保存",
        description: normalized
          ? "別名を変更しました。"
          : "別名を解除しました。",
      })
    } catch (error) {
      const kind = classifySettingsSaveFailure(error)
      if (kind === "validation" && error instanceof SettingsInputValidationError) {
        const result = resolveSettingsValidation(error, ["alias"])
        if (result.fieldErrors.alias) {
          setError("alias", { type: "server", message: result.fieldErrors.alias })
        }
        setFormInvalid(result.formError)
      } else {
        setFailure(kind)
      }
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
          clearErrors("alias")
          setFailure(null)
          setFormInvalid(false)
        }}
        error={
          fieldState.error?.message ??
          (!validation.success ? validation.error.issues[0]?.message : undefined)
        }
      />
      {(failure || formInvalid) && (
        <Alert
          color="red"
          role="alert"
          title={
            failure === "unknown"
              ? "保存結果を確認できませんでした"
              : failure === "blocked"
                ? "Community別名を変更できません"
                : formInvalid
                  ? "入力内容を確認してください"
                  : "保存できませんでした"
          }
        >
          {failure === "unknown"
            ? "入力内容を保持しています。二重保存を避けるため、ページを再読み込みして現在の状態を確認してください。"
            : failure === "blocked"
              ? "入力内容を保持しています。権限を確認して画面を再読み込みしてください。"
              : formInvalid
                ? "入力内容を修正してから保存してください。"
                : "入力内容を保持しています。再度保存してください。"}
        </Alert>
      )}
      <Box>
        <Button
          size="sm"
          loading={saving}
          disabled={!changed || invalid || saving || failure === "unknown" || failure === "blocked"}
          onClick={() => void save()}
        >
          保存
        </Button>
      </Box>
    </Stack>
  )
}
