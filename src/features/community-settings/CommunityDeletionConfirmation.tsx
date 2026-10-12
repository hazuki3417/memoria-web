"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Box, Button, Group, Stack, Text, TextInput, Title } from "@mantine/core"
import { showNotification } from "@/components/Feedback"

type Props = {
  communityId: string
  communityName: string
  managedMediaCount: number
  isAdministrator: boolean
  onDelete?: () => Promise<void>
  onNavigate?: (href: string) => void
}

export function CommunityDeletionConfirmation({
  communityId,
  communityName,
  managedMediaCount,
  isAdministrator,
  onDelete,
  onNavigate,
}: Props) {
  const router = useRouter()
  const [confirmation, setConfirmation] = useState("")
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState("")
  const [completed, setCompleted] = useState(false)
  const settingsPath = `/communities/${encodeURIComponent(communityId)}/settings`
  const navigate = (href: string) => onNavigate ? onNavigate(href) : router.push(href)
  const canDelete = isAdministrator && confirmation === communityName && !!onDelete && !busy && !completed

  const remove = async () => {
    if (!canDelete || !onDelete) return
    setBusy(true)
    setError("")
    try {
      await onDelete()
      setCompleted(true)
      showNotification({ kind: "success", title: "Communityを削除しました", message: "Communityの削除処理が完了しました。" })
      navigate("/dashboard")
    } catch {
      setError("削除処理に失敗しました。最新の状態を確認して再試行してください。")
      showNotification({ kind: "error", title: "Communityを削除できませんでした", message: "現在の状態を確認して再試行してください。" })
    } finally {
      setBusy(false)
    }
  }

  return (
    <Box maw={760} mx="auto" w="100%">
      <Stack gap="xl">
        <Stack gap="xs">
          <Title order={2}>Communityを削除</Title>
          <Text c="red" fw={600}>この操作は取り消せません。</Text>
          <Text>削除対象: <Text span fw={700}>{communityName}</Text></Text>
        </Stack>
        <Stack gap="sm">
          <Title order={3} size="h4">削除されるもの</Title>
          <Text size="sm">Communityと参加者のMembership、Invitation、Group・Tagとその関連は失われます。</Text>
          <Text size="sm">このCommunityが管理するMedia {managedMediaCount} 件は、他のUserがアップロードしたものも含めて復元できない形で削除されます。</Text>
          <Text size="sm">Userが管理するMediaの、このCommunityへの共有と分類は解除されます。</Text>
        </Stack>
        <Stack gap="sm">
          <Title order={3} size="h4">削除されないもの</Title>
          <Text size="sm">User管理Media本体、User側の分類、他のCommunityへの共有は削除されません。</Text>
        </Stack>
        <Stack gap="sm">
          <TextInput
            label="確認のためCommunity名を入力してください"
            description={communityName}
            value={confirmation}
            onChange={(event) => setConfirmation(event.currentTarget.value)}
            error={confirmation && confirmation !== communityName ? "Community名が一致しません。" : undefined}
            disabled={busy || completed || !isAdministrator}
          />
          {!isAdministrator && <Text size="sm" c="red">削除できるのはAdministratorのみです。</Text>}
          {error && <Text size="sm" c="red" role="alert">{error}</Text>}
          <Group justify="flex-end">
            <Button variant="default" disabled={busy} onClick={() => navigate(settingsPath)}>キャンセル</Button>
            <Button color="red" loading={busy} disabled={!canDelete} onClick={() => void remove()}>Communityを削除する</Button>
          </Group>
        </Stack>
      </Stack>
    </Box>
  )
}
