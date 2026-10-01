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
import {
  IconAlertCircle,
  IconAlertTriangle,
  IconInfoCircle,
} from "@tabler/icons-react"
import { useState } from "react"

type ReviewState = "default" | "empty" | "failure" | "retrying"
type CommunityScenario = "requires-resolution" | "no-resolution"
type RetryOutcome = "success" | "failure"

export function AccountDeletionImpactPrototype({
  reviewState = "default",
  communityScenario = "requires-resolution",
  retryOutcome = "success",
}: {
  reviewState?: ReviewState
  communityScenario?: CommunityScenario
  retryOutcome?: RetryOutcome
}) {
  const [loadState, setLoadState] = useState<"ready" | "failed" | "retrying">(
    reviewState === "failure"
      ? "failed"
      : reviewState === "retrying"
        ? "retrying"
        : "ready",
  )
  const [destination, setDestination] = useState<
    "community-resolution" | "final-review" | "cancelled" | null
  >(null)
  const failed = loadState === "failed"
  const retrying = loadState === "retrying"
  const showImpact = destination === null
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
            {showImpact ? (
              <>
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
                    {!failed && !retrying && (
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
                    {(failed || retrying) && (
                      <Alert
                        color={retrying ? "blue" : "red"}
                        title={
                          retrying
                            ? "削除対象のMediaを確認しています"
                            : "削除の影響を確認できませんでした"
                        }
                        icon={
                          retrying ? (
                            <IconInfoCircle size={18} />
                          ) : (
                            <IconAlertCircle size={18} />
                          )
                        }
                        styles={{
                          root: {
                            backgroundColor: `color-mix(in srgb, var(--mantine-color-${retrying ? "blue" : "red"}-6) 7%, var(--mantine-color-body))`,
                          },
                        }}
                      >
                        {retrying
                          ? "Mediaの件数を再取得しています。"
                          : "Mediaの件数を取得できませんでした。もう一度お試しください。"}
                      </Alert>
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
                    <Group gap="sm">
                      {failed || retrying ? (
                        <Button
                          size="sm"
                          loading={retrying}
                          disabled={retrying}
                          onClick={() => setLoadState("retrying")}
                        >
                          再試行
                        </Button>
                      ) : (
                        <Button
                          size="sm"
                          onClick={() =>
                            setDestination(
                              communityScenario === "requires-resolution"
                                ? "community-resolution"
                                : "final-review",
                            )
                          }
                        >
                          次へ
                        </Button>
                      )}
                      <Button
                        size="sm"
                        variant="default"
                        onClick={() => setDestination("cancelled")}
                      >
                        キャンセル
                      </Button>
                    </Group>
                    {retrying && (
                      <Box>
                        <Button
                          size="xs"
                          variant="light"
                          onClick={() =>
                            setLoadState(
                              retryOutcome === "success" ? "ready" : "failed",
                            )
                          }
                        >
                          再取得を完了
                        </Button>
                      </Box>
                    )}
                  </Stack>
                </Box>
              </>
            ) : (
              <Stack gap="md" maw={540}>
                <Title order={1} size="h2">
                  {destination === "community-resolution"
                    ? "Communityの対応"
                    : destination === "final-review"
                      ? "削除内容の最終確認"
                      : "削除手続きを中止しました"}
                </Title>
                <Text c="dimmed">
                  {destination === "community-resolution"
                    ? "最後のAdministratorであるCommunityがあるため、各Communityの対応を選択します。後続画面の試作は別途行います。"
                    : destination === "final-review"
                      ? "対応が必要なCommunityはありません。不要な中間画面を省略して最終確認へ進みます。後続画面の試作は別途行います。"
                      : "削除は開始されていません。削除開始前の画面へ戻る想定です。"}
                </Text>
                <Group gap="sm">
                  <Button
                    size="sm"
                    variant="default"
                    onClick={() => setDestination(null)}
                  >
                    戻る
                  </Button>
                </Group>
              </Stack>
            )}
          </Stack>
        </Box>
      </AppShell.Main>
    </AppShell>
  )
}
