"use client"

import { useState } from "react"
import { useDisclosure } from "@mantine/hooks"
import { showNotification } from "@/components/Feedback"
import { validGroupName } from "./groupName"
import { creationFailureDescription } from "./groupCreationFailureDescription"
import type { GroupBrowserProps } from "./GroupBrowser"

export function useGroupCreateController({
  onCreateGroup,
  runAction,
}: {
  onCreateGroup: GroupBrowserProps["onCreateGroup"]
  runAction: (action: () => Promise<void>) => Promise<"ok" | "busy" | "error">
}) {
  const [createOpened, create] = useDisclosure(false)
  const [createName, setCreateName] = useState("")
  const [createParents, setCreateParents] = useState<string[]>([])
  const [createChildren, setCreateChildren] = useState<string[]>([])
  const openCreate = () => {
    setCreateName("")
    setCreateParents([])
    setCreateChildren([])
    create.open()
  }
  const submitCreate = async () => {
    const name = createName.trim()
    if (!validGroupName(createName)) return
    let outcomeUnknown = false
    let failureDescription =
      "入力内容と通信状態を確認して、もう一度お試しください。"
    const result = await runAction(async () => {
      if (!onCreateGroup)
        throw new Error("Group create operation is not configured")
      let outcome
      try {
        outcome = await onCreateGroup(name, createParents, createChildren)
      } catch (error) {
        failureDescription = creationFailureDescription(error)
        throw error
      }
      if (outcome === "unknown") outcomeUnknown = true
    })
    if (result === "error") {
      showNotification({
        kind: "error",
        title: "Groupを作成できませんでした",
        description: failureDescription,
      })
      return
    }
    if (outcomeUnknown) {
      showNotification({
        kind: "error",
        title: "Groupの作成結果を確認できませんでした",
        description:
          "通信状態が不明です。入力内容は保持されています。必要であればご自身で再試行してください。",
      })
      return
    }
    if (result !== "ok") return
    create.close()
    showNotification({
      kind: "success",
      title: "Groupを作成",
      description: `「${name}」を作成しました。`,
    })
  }

  return {
    createOpened,
    createName,
    createParents,
    createChildren,
    setCreateName,
    setCreateParents,
    setCreateChildren,
    openCreate,
    submitCreate,
    closeCreate: create.close,
  }
}
