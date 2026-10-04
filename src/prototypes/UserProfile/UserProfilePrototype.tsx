"use client"

import {
  Box,
  Button,
  Group,
  Modal,
  Stack,
  Text,
  TextInput,
} from "@mantine/core"
import { useDisclosure } from "@mantine/hooks"
import { Notifications } from "@mantine/notifications"
import { useCallback, useEffect, useState } from "react"
import { FeedbackAlert, showNotification } from "@/components/Feedback"
import { getApplicationNavigation } from "@/components/ApplicationShell"
import { PrototypeApplicationShell } from "@/prototypes/PrototypeApplicationShell"
import { PageHeader } from "@/components/PageHeader"
import { SectionHeader } from "@/components/SectionHeader"

const personalContext = { id: "personal", kind: "personal" as const, label: "Personal", accentColor: "var(--mantine-color-blue-6)" }

type ReviewState =
  | "default"
  | "invalid"
  | "saving"
  | "success"
  | "failure"
  | "blocking"
  | "unsaved"

export function UserProfilePrototype({
  reviewState = "default",
}: {
  reviewState?: ReviewState
}) {
  const [savedName, setSavedName] = useState("ユーザー")
  const [nickname, setNickname] = useState(
    reviewState === "invalid"
      ? "   "
      : reviewState === "unsaved"
        ? "新しいニックネーム"
        : "ユーザー",
  )
  const [status, setStatus] = useState<ReviewState>(reviewState)
  const [discardOpened, { open: openDiscard, close: closeDiscard }] =
    useDisclosure(false)
  const normalized = nickname.trim()
  const invalid = normalized.length === 0
  const dirty = normalized !== savedName
  const saving = status === "saving"
  const blocking = status === "blocking"

  const showFeedback = useCallback((kind: "success" | "failure") => {
    const success = kind === "success"
    showNotification({
      kind: success ? "success" : "error",
      title: success ? "保存しました" : "保存できませんでした",
      message: success
        ? "プロフィールを更新しました。"
        : "保存処理中に問題が発生しました。変更内容は保持されています。もう一度お試しください。",
    })
  }, [])

  useEffect(() => {
    if (reviewState === "success") {
      showFeedback("success")
    } else if (reviewState === "failure") {
      showFeedback("failure")
    }
  }, [reviewState, showFeedback])

  const save = () => {
    if (!dirty || invalid || saving || blocking) return
    setSavedName(normalized)
    setNickname(normalized)
    setStatus("success")
    showFeedback("success")
  }

  return (
    <>
      <Notifications position="top-right" />
      <PrototypeApplicationShell
        currentContext={personalContext}
        contexts={[personalContext]}
        navigationItems={getApplicationNavigation({ contextKind: "personal" })}
      >
          <Box maw={880} mx="auto" w="100%">
            <Stack gap="xl">
              <PageHeader
                title="プロフィール"
                description="Memoriaで使用するプロフィール情報を管理します。"
              />
              <Box>
                <SectionHeader>基本情報</SectionHeader>
                <Stack gap="md" maw={540}>
                  <Box maw={440}>
                    <TextInput
                      label="ニックネーム"
                      description="Memoria内で表示される名前です。"
                      value={nickname}
                      onChange={(event) => {
                        setNickname(event.currentTarget.value)
                        setStatus("default")
                      }}
                      error={invalid}
                      aria-describedby="nickname-error"
                      disabled={saving || blocking}
                      required
                    />
                    <Box mih={22} mt={4} id="nickname-error" aria-live="polite">
                      {invalid && (
                        <Text size="xs" c="red">
                          ニックネームを入力してください。
                        </Text>
                      )}
                    </Box>
                  </Box>
                  <Group gap="sm">
                    <Button
                      size="sm"
                      onClick={save}
                      disabled={!dirty || invalid || saving || blocking}
                      loading={saving}
                    >
                      保存
                    </Button>
                    {dirty && (
                      <Button
                        size="sm"
                        variant="default"
                        onClick={openDiscard}
                        disabled={saving || blocking}
                      >
                        キャンセル
                      </Button>
                    )}
                  </Group>
                  <Box mih={92} aria-live="polite">
                    {blocking && (
                      <FeedbackAlert
                        kind="error"
                        title="プロフィールを更新できませんでした"
                      >
                        現在のアカウント状態ではプロフィールを更新できません。アカウントの状態を確認してください。
                      </FeedbackAlert>
                    )}
                  </Box>
                </Stack>
              </Box>
            </Stack>
          </Box>
      </PrototypeApplicationShell>
      <Modal
        opened={discardOpened}
        onClose={closeDiscard}
        title="変更を破棄しますか？"
        centered
      >
        <Stack>
          <Text size="sm">保存していない変更は失われます。</Text>
          <Group justify="flex-end">
            <Button variant="default" onClick={closeDiscard}>
              編集を続ける
            </Button>
            <Button
              color="red"
              onClick={() => {
                setNickname(savedName)
                setStatus("default")
                closeDiscard()
              }}
            >
              変更を破棄
            </Button>
          </Group>
        </Stack>
      </Modal>
    </>
  )
}
