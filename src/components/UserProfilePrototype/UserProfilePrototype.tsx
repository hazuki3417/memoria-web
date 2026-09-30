"use client"

import {
  Alert,
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
import { Notifications, notifications } from "@mantine/notifications"
import { IconAlertCircle, IconCheck } from "@tabler/icons-react"
import { useEffect, useState } from "react"

type ReviewState = "default" | "invalid" | "saving" | "success" | "failure" | "blocking" | "unsaved"

export function UserProfilePrototype({ reviewState = "default" }: { reviewState?: ReviewState }) {
  const [savedName, setSavedName] = useState("ユーザー")
  const [nickname, setNickname] = useState(reviewState === "invalid" ? "   " : reviewState === "unsaved" ? "新しいニックネーム" : "ユーザー")
  const [status, setStatus] = useState<ReviewState>(reviewState)
  const [discardOpened, { open: openDiscard, close: closeDiscard }] = useDisclosure(false)
  const normalized = nickname.trim()
  const invalid = normalized.length === 0
  const dirty = normalized !== savedName
  const saving = status === "saving"
  const blocking = status === "blocking"

  const showFeedback = (kind: "success" | "failure") => {
    const success = kind === "success"
    notifications.show({
      message: (
        <Alert
          color={success ? "green" : "red"}
          title={success ? "保存しました" : "保存できませんでした"}
          icon={success ? <IconCheck size={18} /> : <IconAlertCircle size={18} />}
        >
          {success ? "プロフィールを更新しました。" : "変更内容は保持されています。再試行してください。"}
        </Alert>
      ),
      withCloseButton: true,
      styles: {
        root: { padding: 0, border: 0, background: "transparent", boxShadow: "none" },
        body: { margin: 0 },
        description: { margin: 0 },
        closeButton: { position: "absolute", top: 8, right: 8, zIndex: 1 },
      },
    })
  }

  useEffect(() => {
    if (reviewState === "success") {
      showFeedback("success")
    } else if (reviewState === "failure") {
      showFeedback("failure")
    }
  }, [reviewState])

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
      <AppShell header={{ height: 40 }} padding="lg">
      <AppShell.Header>
        <Group h="100%" px="md" gap="sm">
          <Text fw={750} size="lg">Memoria</Text>
          <Text size="sm" c="dimmed">/</Text>
          <Text size="sm">Personal</Text>
        </Group>
      </AppShell.Header>
      <AppShell.Main>
        <Box maw={880} mx="auto" w="100%">
          <Stack gap="xl">
            <Box>
              <Title order={1} size="h2">プロフィール</Title>
              <Text c="dimmed" size="sm" mt={4}>Memoriaで使用するプロフィール情報を管理します。</Text>
            </Box>
            <Box>
              <Title order={2} size="h4">基本情報</Title>
              <Divider my="md" />
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
                    {invalid && <Text size="xs" c="red">ニックネームを入力してください。</Text>}
                  </Box>
                </Box>
                <Group gap="sm">
                  <Button size="sm" onClick={save} disabled={!dirty || invalid || saving || blocking} loading={saving}>
                    保存
                  </Button>
                  {dirty && (
                    <Button size="sm" variant="default" onClick={openDiscard} disabled={saving || blocking}>
                      キャンセル
                    </Button>
                  )}
                </Group>
                <Box mih={92} aria-live="polite">
                  {blocking && (
                    <Alert color="red" title="プロフィールを変更できません" icon={<IconAlertCircle size={18} />}>
                      現在のアカウント状態では編集を続けられません。アカウントの状態を確認してください。
                    </Alert>
                  )}
                </Box>
              </Stack>
            </Box>
          </Stack>
        </Box>
      </AppShell.Main>
      </AppShell>
      <Modal opened={discardOpened} onClose={closeDiscard} title="変更を破棄しますか？" centered>
        <Stack>
          <Text size="sm">保存していない変更は失われます。</Text>
          <Group justify="flex-end">
            <Button variant="default" onClick={closeDiscard}>編集を続ける</Button>
            <Button color="red" onClick={() => { setNickname(savedName); setStatus("default"); closeDiscard() }}>
              変更を破棄
            </Button>
          </Group>
        </Stack>
      </Modal>
    </>
  )
}
