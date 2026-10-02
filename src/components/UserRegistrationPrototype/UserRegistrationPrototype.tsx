"use client"

import {
  AppShell,
  Box,
  Button,
  Divider,
  Group,
  Modal,
  Stack,
  Text,
  TextInput,
  Title,
} from "@mantine/core"
import { useDisclosure } from "@mantine/hooks"
import { Notifications } from "@mantine/notifications"
import { useCallback, useEffect, useState } from "react"
import {
  PrototypeFormAlert,
  showPrototypeNotification,
} from "../PrototypeFeedback/PrototypeFeedback"

type ReviewState =
  | "default"
  | "invalid"
  | "registering"
  | "failure"
  | "blocking"
  | "registered"
  | "no-display-name"

export function UserRegistrationPrototype({
  reviewState = "default",
}: {
  reviewState?: ReviewState
}) {
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
    showPrototypeNotification({
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
    showFeedback("success")
  }

  return (
    <>
      <Notifications position="top-right" />
      <AppShell header={{ height: 40 }} padding="lg">
        <AppShell.Header>
          <Group h="100%" px="md" gap="sm">
            <Text fw={750} size="lg">
              Memoria
            </Text>
          </Group>
        </AppShell.Header>
        <AppShell.Main>
          <Box maw={880} mx="auto" w="100%">
            <Stack gap="xl">
              <Box>
                <Title order={1} size="h2">
                  Memoriaへようこそ
                </Title>
                <Text c="dimmed" size="sm" mt={4}>
                  Memoriaで使用するプロフィールを設定して、登録を完了してください。
                </Text>
              </Box>
              <Box>
                <Title order={2} size="h4">
                  基本情報
                </Title>
                <Divider my="md" />
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
                        invalid ||
                        registering ||
                        blocking ||
                        registered ||
                        exited
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
                      <PrototypeFormAlert
                        kind="error"
                        title="登録できませんでした"
                      >
                        認証情報を確認できませんでした。もう一度ログインしてください。
                      </PrototypeFormAlert>
                    )}
                    {exited && (
                      <PrototypeFormAlert
                        kind="info"
                        title="登録せずに終了しました"
                      >
                        実際の画面ではログアウトして公開画面へ戻ります。
                      </PrototypeFormAlert>
                    )}
                  </Box>
                </Stack>
              </Box>
            </Stack>
          </Box>
        </AppShell.Main>
      </AppShell>
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
