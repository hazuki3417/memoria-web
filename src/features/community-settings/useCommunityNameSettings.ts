"use client"

import { useEffect, useRef, useState, type SetStateAction } from "react"
import { useController, useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import type { z } from "zod"
import { communityNameSchema } from "./communityNameSchema"
import { showNotification } from "@/components/Feedback"
import {
  classifySettingsSaveFailure,
  resolveSettingsFailureValidation,
  type SettingsSaveFailureKind,
} from "@/features/settings/graphqlSettingsResult"

export function useCommunityNameSettings({
  communityName,
  onSaveName,
}: {
  communityName?: string
  onSaveName?: (name: string) => Promise<string>
}) {
  const initialName = communityName ?? "家族のアルバム"
  const { control, reset, getValues, handleSubmit, setError, clearErrors } = useForm<
    z.input<typeof communityNameSchema>,
    unknown,
    z.output<typeof communityNameSchema>
  >({
    resolver: zodResolver(communityNameSchema),
    mode: "onChange",
    defaultValues: { name: initialName },
  })
  const { field, fieldState } = useController({ control, name: "name" })
  const savedName = useRef(initialName)
  const [savingName, setSavingName] = useState(false)
  const [failure, setFailure] = useState<SettingsSaveFailureKind | null>(null)
  const [formInvalid, setFormInvalid] = useState(false)
  // Refresh an untouched form, but never replace the user's unsaved draft.
  useEffect(() => {
    if (communityName === undefined) return
    const draftIsEdited = getValues("name").trim() !== savedName.current
    savedName.current = communityName
    if (!draftIsEdited) reset({ name: communityName })
  }, [communityName, getValues, reset])
  const draft = field.value
  const setDraft = (next: SetStateAction<string>) => {
    field.onChange(typeof next === "function" ? next(field.value) : next)
    clearErrors("name")
    setFailure((current) =>
      current === "unknown" || current === "blocked" ? current : null,
    )
    setFormInvalid(false)
  }
  const saveName = () => {
    if (savingName || failure === "unknown" || failure === "blocked") return
    void handleSubmit(async ({ name: updated }) => {
      setSavingName(true)
      setFailure(null)
      setFormInvalid(false)
      clearErrors("name")
      try {
        const confirmed = onSaveName ? await onSaveName(updated) : updated
        savedName.current = confirmed
        // A late response must not erase an edit made after Submit.
        if (getValues("name").trim() === updated) reset({ name: confirmed })
        showNotification({
          kind: "success",
          title: "Community名を変更",
          description: "Community名を変更しました。",
        })
      } catch (error) {
        const kind = classifySettingsSaveFailure(error)
        if (kind === "validation") {
          const result = resolveSettingsFailureValidation(error, ["name"])
          if (result.fieldErrors.name) {
            setError("name", { type: "server", message: result.fieldErrors.name })
          }
          setFormInvalid(result.formError)
        } else {
          setFailure(kind)
        }
      } finally {
        setSavingName(false)
      }
    })()
  }

  const dirty = draft.trim() !== savedName.current
  const invalid = !communityNameSchema.safeParse({ name: draft }).success
  const saveFeedback = formInvalid
    ? { title: "入力内容を確認してください", description: "入力内容を修正してから保存してください。" }
    : failure === "blocked"
      ? { title: "Community名を変更できません", description: "権限を確認して画面を再読み込みしてください。" }
      : failure === "unknown"
        ? { title: "保存結果を確認できませんでした", description: "二重保存を避けるため、ページを再読み込みして現在の状態を確認してください。" }
        : failure === "retryable"
          ? { title: "保存できませんでした", description: "入力内容を保持しています。内容を確認して再度保存してください。" }
          : null

  return {
    draft, setDraft, dirty, invalid, savingName, saveName,
    fieldError: fieldState.error?.message,
    saveFeedback,
    saveBlocked: failure === "blocked" || failure === "unknown",
  }
}
