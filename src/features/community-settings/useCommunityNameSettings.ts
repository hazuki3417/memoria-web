"use client"

import { useEffect, useState } from "react"
import { showNotification } from "@/components/Feedback"

export function useCommunityNameSettings({ communityName, onSaveName }: {
  communityName?: string
  onSaveName?: (name: string) => Promise<boolean>
}) {
  const [name, setName] = useState(communityName ?? "家族のアルバム")
  const [draft, setDraft] = useState(name)
  const [savingName, setSavingName] = useState(false)
  useEffect(() => {
    if (communityName === undefined) return
    setName(communityName)
    setDraft(communityName)
  }, [communityName])
  const saveName = () => {
    if (savingName) return
    const updated = draft.trim()
    if (!onSaveName) {
      setName(updated)
      setDraft(updated)
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
        setName(updated)
        setDraft(updated)
        showNotification({
          kind: "success",
          title: "Community名を変更",
          description: "Community名を変更しました。",
        })
      })
      .finally(() => setSavingName(false))
  }

  const dirty = draft.trim() !== name
  const invalid = !draft.trim()
  return { draft, setDraft, dirty, invalid, savingName, saveName }
}
