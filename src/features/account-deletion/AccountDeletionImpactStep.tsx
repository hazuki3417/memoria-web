import { Box, Button, Divider, Group, Stack, Text, Title } from "@mantine/core"
import { FeedbackAlert } from "@/components/Feedback"
import type { AccountDeletionController } from "./useAccountDeletionController"
import type { RetryOutcome } from "./accountDeletionScenarios"

export function AccountDeletionImpactStep({
  flow, retryOutcome,
}: {
  flow: AccountDeletionController
  retryOutcome: RetryOutcome
}) {
  const { compactStepper, loadState, setLoadState, mediaCount, cancel, next } = flow
  return (
                  <Box w="100%">
                    {!compactStepper && (
                      <>
                        <Title order={2} size="h4">
                          個人データへの影響
                        </Title>
                        <Divider my="md" />
                      </>
                    )}
                    <Stack gap="lg">
                      {loadState === "ready" ? (
                        <Box>
                          <Text c="dimmed" size="sm">
                            削除されるMedia
                          </Text>
                          {mediaCount === 0 ? (
                            <Text mt={4}>削除されるMediaはありません</Text>
                          ) : (
                            <Title order={3} size="h2" mt={4}>
                              {mediaCount}件
                            </Title>
                          )}
                        </Box>
                      ) : (
                        <FeedbackAlert
                          kind={loadState === "retrying" ? "info" : "error"}
                          title={
                            loadState === "retrying"
                              ? "削除されるMediaを確認しています"
                              : "削除されるMediaを確認できませんでした"
                          }
                        >
                          {loadState === "retrying"
                            ? "Mediaの件数を再取得しています。"
                            : "削除されるMediaの件数を確認できませんでした。再試行してください。"}
                        </FeedbackAlert>
                      )}
                      <Box>
                        <Title order={2} size="h4">
                          注意事項
                        </Title>
                        <Divider my="md" />
                        <FeedbackAlert
                          kind="error"
                          title="削除したデータは復元できません"
                        >
                          アカウントとあなたが管理するMediaが削除されます。
                        </FeedbackAlert>
                      </Box>
                      {loadState === "ready" && (
                        <Text c="dimmed" size="sm">
                          Communityに参加している場合は、次のステップで各Communityへの対応と影響を確認します。
                        </Text>
                      )}
                      <Group gap="sm" justify="space-between" wrap="nowrap">
                        <Box style={{ flex: 1 }} />
                        <Box
                          style={{
                            flex: 1,
                            display: "flex",
                            justifyContent: "center",
                          }}
                        >
                          <Button
                            size="sm"
                            variant="subtle"
                            color="gray"
                            onClick={cancel}
                          >
                            削除手続きを中止して設定に戻る
                          </Button>
                        </Box>
                        <Box
                          style={{
                            flex: 1,
                            display: "flex",
                            justifyContent: "flex-end",
                          }}
                        >
                          {loadState !== "ready" ? (
                            <Button
                              size="sm"
                              loading={loadState === "retrying"}
                              disabled={loadState === "retrying"}
                              onClick={() => setLoadState("retrying")}
                            >
                              再試行
                            </Button>
                          ) : (
                            <Button size="sm" onClick={next}>
                              次へ
                            </Button>
                          )}
                        </Box>
                      </Group>
                      {loadState === "retrying" && (
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
                      )}
                    </Stack>
                  </Box>
  )
}
