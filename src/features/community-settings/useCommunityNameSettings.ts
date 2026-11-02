"use client"

import { useEffect, useRef, useState, type SetStateAction } from "react"
import { useController, useForm } from "react-hook-form"
import { showNotification } from "@/components/Feedback"

export function useCommunityNameSettings({
  communityName,
  onSaveName,
}: {
  communityName?: string
  onSaveName?: (name: string) => Promise<boolean>
}) {
  const initialName = communityName ?? "家族のアルバム"
  const { control, reset } = useForm<{ name: string }>({
    defaultValues: { name: initialName },
  })
  const { field } = useController({ control, name: "name" })
  const savedName = useRef(initialName)
  const [savingName, setSavingName] = useState(false)
  // Preserve the existing server-refresh behavior, including replacing a draft.
  useEffect(() => {
    if (communityName === undefined) return
    savedName.current = communityName
    reset({ name: communityName })
  }, [communityName, reset])
  const draft = field.value
  const setDraft = (next: SetStateAction<string>) => {
    field.onChange(typeof next === "function" ? next(field.value) : next)
  }
  const saveName = () => {
    if (savingName) return
    const updated = draft.trim()
    if (!onSaveName) {
      savedName.current = updated
      reset({ name: updated })
      showNotification({
        kind: "success",
        title: "Community名を変更",
        description: "Community名を変更しました。",
      })
      return
    }
    setSavingName(true)
    void onSaveName(updated)
      .then((saved) => {
        if (!saved) return
        savedName.current = updated
        reset({ name: updated })
        showNotification({
          kind: "success",
          title: "Community名を変更",
          description: "Community名を変更しました。",
        })
      })
      .finally(() => setSavingName(false))
  }

  const dirty = draft.trim() !== savedName.current
  const invalid = !draft.trim()
  return { draft, setDraft, dirty, invalid, savingName, saveName }
}
