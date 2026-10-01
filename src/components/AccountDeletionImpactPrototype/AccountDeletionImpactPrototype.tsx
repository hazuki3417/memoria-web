"use client"

import {
  Alert,
  AppShell,
  Box,
  Button,
  Divider,
  Group,
  Stack,
  Text,
  Title,
} from "@mantine/core"
import { IconAlertCircle, IconAlertTriangle } from "@tabler/icons-react"
import { useState } from "react"

type ReviewState = "default" | "empty" | "failure"

export function AccountDeletionImpactPrototype({
  reviewState = "default",
}: {
  reviewState?: ReviewState
}) {
  const [failed, setFailed] = useState(reviewState === "failure")
  const [completed, setCompleted] = useState<"next" | "cancel" | null>(null)
  const mediaCount = reviewState === "empty" ? 0 : 24

  return (
    <AppShell header={{ height: 40 }} padding="lg">
      <AppShell.Header>
        <Group h="100%" px="md" gap="sm">
          <Text fw={750} size="lg">
            Memoria
          </Text>
          <Text size="sm" c="dimmed">
            /
          </Text>
          <Text size="sm">Personal</Text>
        </Group>
      </AppShell.Header>
      <AppShell.Main>
        <Box maw={880} mx="auto" w="100%">
          <Stack gap="xl">
            <Box>
              <Title order={1} size="h2">
                アカウント削除
              </Title>
              <Text c="dimmed" size="sm" mt={4}>
                アカウント削除による影響を確認してください。
              </Text>
            </Box>
            <Box>
              <Title order={2} size="h4">
                削除されるデータ
              </Title>
              <Divider my="md" />
              <Stack gap="lg" maw={540}>
                {!failed && (
                  <Box>
                    <Text size="sm" c="dimmed">
                      削除対象のMedia
                    </Text>
                    {mediaCount === 0 ? (
                      <Text mt={4}>削除対象のMediaはありません</Text>
                    ) : (
                      <Title order={3} size="h2" mt={4}>
                        {mediaCount}件
                      </Title>
                    )}
                  </Box>
                )}
                <Alert
                  color="red"
                  title="削除したデータは復元できません"
                  icon={<IconAlertTriangle size={18} />}
                  styles={{
                    root: {
                      backgroundColor:
                        "color-mix(in srgb, var(--mantine-color-red-6) 7%, var(--mantine-color-body))",
                    },
                  }}
                >
                  アカウントと、あなたが管理するMediaが削除されます。
                </Alert>
                <Text size="sm" c="dimmed">
                  Communityへの影響は、次の画面以降で確認します。
                </Text>
                {failed && (
                  <Alert
                    color="red"
                    title="削除の影響を確認できませんでした"
                    icon={<IconAlertCircle size={18} />}
                    styles={{
                      root: {
                        backgroundColor:
                          "color-mix(in srgb, var(--mantine-color-red-6) 7%, var(--mantine-color-body))",
                      },
                    }}
                  >
                    Mediaの件数を取得できませんでした。もう一度お試しください。
                  </Alert>
                )}
                <Group gap="sm">
                  {failed ? (
                    <Button size="sm" onClick={() => setFailed(false)}>
                      再試行
                    </Button>
                  ) : (
                    <Button size="sm" onClick={() => setCompleted("next")}>
                      次へ
                    </Button>
                  )}
                  <Button
                    size="sm"
                    variant="default"
                    onClick={() => setCompleted("cancel")}
                  >
                    キャンセル
                  </Button>
                </Group>
                {completed && (
                  <Text size="sm" c="dimmed" aria-live="polite">
                    {completed === "next"
                      ? "次の画面へ進みます（画面試作）。"
                      : "削除手続きを中止しました（画面試作）。"}
                  </Text>
                )}
              </Stack>
            </Box>
          </Stack>
        </Box>
      </AppShell.Main>
    </AppShell>
  )
}
