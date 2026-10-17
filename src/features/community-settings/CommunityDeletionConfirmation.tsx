"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import {
  Box,
  Button,
  Divider,
  Group,
  Modal,
  Stack,
  Stepper,
  Text,
  TextInput,
  Title,
} from "@mantine/core"
import { useMediaQuery } from "@mantine/hooks"
import { FeedbackAlert, showNotification } from "@/components/Feedback"

type Props = {
  communityId: string
  communityName: string
  managedMediaCount: number
  isAdministrator: boolean
  onDelete?: () => Promise<void>
  onReviewChanged?: () => void
  onNavigate?: (href: string) => void
}

export function CommunityDeletionConfirmation({
  communityId,
  communityName,
  managedMediaCount,
  isAdministrator,
  onDelete,
  onReviewChanged,
  onNavigate,
}: Props) {
  const router = useRouter()
  const [step, setStep] = useState(0)
  const compact = useMediaQuery("(max-width: 48em)")
  const [cancelOpened, setCancelOpened] = useState(false)
  const [confirmation, setConfirmation] = useState("")
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState("")
  const [completed, setCompleted] = useState(false)
  const [outcomeUnknown, setOutcomeUnknown] = useState(false)
  const settingsPath = `/communities/${encodeURIComponent(communityId)}/settings`
  const navigate = (href: string) =>
    onNavigate ? onNavigate(href) : router.push(href)
  const cancel = () =>
    confirmation ? setCancelOpened(true) : navigate(settingsPath)
  const canDelete =
    isAdministrator &&
    confirmation === communityName &&
    !!onDelete &&
    !busy &&
    !completed &&
    !outcomeUnknown

  const remove = async () => {
    if (!canDelete || !onDelete) return
    setBusy(true)
    setError("")
    try {
      await onDelete()
      setCompleted(true)
      showNotification({
        kind: "success",
        title: "Community削除の受付",
        description: "Communityの削除を受け付けました。Mediaの物理削除は後続処理で行われます。",
      })
      navigate("/dashboard")
    } catch (caught) {
      const changed = caught instanceof Error && caught.message === "REVIEW_CHANGED"
      setError(changed
        ? "削除対象の状態が変わりました。最新の内容で確認をやり直してください。"
        : "削除受付の結果を確認できませんでした。再実行せず、最新の状態を確認してください。",
      )
      if (changed) onReviewChanged?.()
      else setOutcomeUnknown(true)
      showNotification({
        kind: "error",
        title: "Communityを削除",
        description: "最新の状態を確認してください。結果不明の操作を無条件に再実行しないでください。",
      })
    } finally {
      setBusy(false)
    }
  }

  const labels = ["削除の影響", "Communityへの影響", "最終確認"]
  return (
    <>
      <Modal
        opened={cancelOpened}
        onClose={() => setCancelOpened(false)}
        centered
        title="Community削除を中止しますか？"
      >
        <Stack gap="lg">
          <Text size="sm">
            確認のために入力した内容は保存されません。削除は開始されません。
          </Text>
          <Group justify="flex-end">
            <Button variant="default" onClick={() => setCancelOpened(false)}>
              確認を続ける
            </Button>
            <Button onClick={() => navigate(settingsPath)}>中止する</Button>
          </Group>
        </Stack>
      </Modal>
      <Box maw={960} mx="auto" w="100%">
        <Stack gap="xl">
          <Box>
            <Title order={1} size="h2">
              Community削除
            </Title>
            <Text c="dimmed" size="sm" mt={4}>
              Communityを削除した場合の影響と、削除対象を確認します。
            </Text>
          </Box>
          <Box
            style={{
              position: "sticky",
              top: 0,
              zIndex: 10,
              background: "var(--mantine-color-body)",
              borderBottom: "1px solid var(--mantine-color-default-border)",
              paddingTop: 12,
              paddingBottom: 12,
            }}
          >
            {compact ? (
              <Stack gap={4}>
                <Text size="xs" c="dimmed">
                  ステップ {step + 1}/3
                </Text>
                <Text fw={600}>{labels[step]}</Text>
              </Stack>
            ) : (
              <Stepper active={step} allowNextStepsSelect={false} size="sm">
                {labels.map((label) => (
                  <Stepper.Step key={label} label={label} />
                ))}
              </Stepper>
            )}
          </Box>
          {step === 0 && (
            <Stack gap="lg">
              {!compact && (
                <>
                  <Title order={2} size="h4">
                    削除の影響
                  </Title>
                  <Divider />
                </>
              )}
              <Text c="dimmed" size="sm">
                削除対象Community
              </Text>
              <Title order={3} size="h3">
                {communityName}
              </Title>
              <FeedbackAlert
                kind="error"
                title="削除したデータは復元できません"
              >
                CommunityとCommunity管理Mediaは復元不能に削除されます。
              </FeedbackAlert>
              <Text size="sm">
                MembershipとInvitationは失われ、Group・Tagとその関連も削除されます。
              </Text>
            </Stack>
          )}
          {step === 1 && (
            <Stack gap="lg">
              {!compact && (
                <>
                  <Title order={2} size="h4">
                    Communityへの影響
                  </Title>
                  <Divider />
                </>
              )}
              <Box>
                <Text c="dimmed" size="sm">
                  削除されるCommunity管理Media
                </Text>
                <Title order={3} size="h2" mt={4}>
                  {managedMediaCount}件
                </Title>
              </Box>
              <FeedbackAlert
                kind="error"
                title="他のUserのアップロードも削除対象です"
              >
                Community管理Mediaは、アップロードしたUserに関係なく復元できない形で削除されます。
              </FeedbackAlert>
              <Text size="sm">
                User管理MediaのこのCommunityへの共有と分類は解除されます。
              </Text>
              <FeedbackAlert kind="info" title="削除されないもの">
                User管理Media本体、User側分類、他Communityへの共有は削除されません。
              </FeedbackAlert>
            </Stack>
          )}
          {step === 2 && (
            <Stack gap="lg">
              {!compact && (
                <>
                  <Title order={2} size="h4">
                    最終確認
                  </Title>
                  <Divider />
                </>
              )}
              <Text size="sm">
                削除対象:{" "}
                <Text span fw={700}>
                  {communityName}
                </Text>
              </Text>
              <Text size="sm">
                Community管理Media {managedMediaCount}{" "}
                件を含めて削除します。この操作は取り消せません。
              </Text>
              <TextInput
                label="確認のためCommunity名を入力してください"
                description={communityName}
                value={confirmation}
                onChange={(event) => setConfirmation(event.currentTarget.value)}
                error={
                  confirmation && confirmation !== communityName
                    ? "Community名が一致しません。"
                    : undefined
                }
                disabled={busy || completed || !isAdministrator}
              />
              {!isAdministrator && (
                <FeedbackAlert kind="error" title="削除できません">
                  Administratorのみ削除できます。
                </FeedbackAlert>
              )}
              {error && (
                <Stack gap="xs">
                  <Text size="sm" c="red" role="alert">{error}</Text>
                  {outcomeUnknown && onReviewChanged && (
                    <Button variant="default" onClick={onReviewChanged}>
                      最新の状態を確認する
                    </Button>
                  )}
                </Stack>
              )
            </Stack>
          )}
          <Group gap="sm" justify="space-between" wrap="nowrap">
            <Box
              style={{
                flex: 1,
                minWidth: 0,
                display: "flex",
                justifyContent: "flex-start",
              }}
            >
              {step > 0 && (
                <Button
                  size="sm"
                  variant="default"
                  disabled={busy || completed}
                  onClick={() => setStep(step - 1)}
                >
                  戻る
                </Button>
              )}
            </Box>
            <Box
              style={{
                flex: 1,
                minWidth: 0,
                display: "flex",
                justifyContent: "center",
              }}
            >
              <Button
                size="sm"
                variant="subtle"
                color="gray"
                disabled={busy || completed}
                onClick={cancel}
              >
                削除手続きを中止して設定に戻る
              </Button>
            </Box>
            <Box
              style={{
                flex: 1,
                minWidth: 0,
                display: "flex",
                justifyContent: "flex-end",
              }}
            >
              {step < 2 ? (
                <Button
                  size="sm"
                  disabled={!isAdministrator || busy}
                  onClick={() => setStep(step + 1)}
                >
                  次へ
                </Button>
              ) : (
                <Button
                  size="sm"
                  color="red"
                  loading={busy}
                  disabled={!canDelete}
                  onClick={() => void remove()}
                >
                  Communityを削除する
                </Button>
              )}
            </Box>
          </Group>
        </Stack>
      </Box>
    </>
  )
}
