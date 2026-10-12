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
import { useRouter } from "next/navigation"
import {
  ApplicationHeader,
  ApplicationShell,
} from "@/components/ApplicationShell"
import { FeedbackAlert, showNotification } from "@/components/Feedback"
import { PageHeader } from "@/components/PageHeader"
import { SectionHeader } from "@/components/SectionHeader"

type ReviewState =
  | "default"
  | "invalid"
  | "registering"
  | "failure"
  | "blocking"
  | "registered"
  | "no-display-name"

export function UserRegistration({
  reviewState = "default",
}: {
  reviewState?: ReviewState
}) {
  const router = useRouter()
  const [nickname, setNickname] = useState(
    reviewState === "invalid"
      ? "   "
      : reviewState === "no-display-name"
        ? ""
        : "ユーザー",
  )
  const [status, setStatus] = useState<ReviewState>(reviewState)
  const [exitOpened, { open: openExit, close: closeExit }] =
    useDisclosure(false)
  const [exited, setExited] = useState(false)
  const invalid = nickname.trim().length === 0
  const registering = status === "registering"
  const blocking = status === "blocking"
  const registered = status === "registered"

  const showFeedback = useCallback((kind: "success" | "failure") => {
    const success = kind === "success"
    showNotification({
      kind: success ? "success" : "error",
      title: success ? "登録しました" : "登録できませんでした",
      message: success
        ? "登録が完了しました。"
        : "入力内容は保持されています。再試行してください。",
    })
  }, [])

  useEffect(() => {
    if (reviewState === "failure") {
      showFeedback("failure")
    } else if (reviewState === "registered") {
      showFeedback("success")
    }
  }, [reviewState, showFeedback])

  const register = () => {
    if (invalid || registering || blocking || registered) return
    // Visual prototype only: actual registration and navigation are not connected.
    setStatus("registered")
    window.sessionStorage.setItem("memoria:registration-success", "1")
    router.replace("/dashboard")
  }

  return (
    <>
      <Notifications position="top-right" />
      <ApplicationShell header={<ApplicationHeader reserveNavigationSpace />}>
        <Box maw={880} mx="auto" w="100%">
          <Stack gap="xl">
            <PageHeader
              title="Memoriaへようこそ"
              description="Memoriaで使用するプロフィールを設定して、登録を完了してください。"
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
                      if (status === "failure") setStatus("default")
                    }}
                    error={invalid}
                    aria-describedby="registration-nickname-error"
                    disabled={registering || blocking || registered || exited}
                    required
                  />
                  <Box
                    mih={22}
                    mt={4}
                    id="registration-nickname-error"
                    aria-live="polite"
                  >
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
                    onClick={register}
                    disabled={
                      invalid || registering || blocking || registered || exited
                    }
                    loading={registering}
                  >
                    登録
                  </Button>
                  <Button
                    size="sm"
                    variant="default"
                    onClick={openExit}
                    disabled={registering || registered || exited}
                  >
                    終了
                  </Button>
                </Group>
                <Box mih={92} aria-live="polite">
                  {blocking && (
                    <FeedbackAlert kind="error" title="登録できませんでした">
                      認証情報を確認できませんでした。もう一度ログインしてください。
                    </FeedbackAlert>
                  )}
                  {exited && (
                    <FeedbackAlert kind="info" title="登録せずに終了しました">
                      実際の画面ではログアウトして公開画面へ戻ります。
                    </FeedbackAlert>
                  )}
                </Box>
              </Stack>
            </Box>
          </Stack>
        </Box>
      </ApplicationShell>
      <Modal
        opened={exitOpened}
        onClose={closeExit}
        title="登録せずに終了しますか？"
        centered
      >
        <Stack>
          <Text size="sm">
            登録せずに終了すると、ログアウトしてトップページに戻ります。
          </Text>
          <Group justify="flex-end">
            <Button variant="default" onClick={closeExit}>
              戻る
            </Button>
            <Button
              color="red"
              onClick={() => {
                closeExit()
                setExited(true)
              }}
            >
              終了
            </Button>
          </Group>
        </Stack>
      </Modal>
    </>
  )
}
