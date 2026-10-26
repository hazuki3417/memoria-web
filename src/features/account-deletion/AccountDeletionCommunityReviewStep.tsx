import { Badge, Box, Button, Divider, Group, Stack, Text, TextInput, Title } from "@mantine/core"
import { FeedbackAlert } from "@/components/Feedback"
import type { AccountDeletionController } from "./useAccountDeletionController"

export function AccountDeletionCommunityReviewStep({
  flow,
}: {
  flow: AccountDeletionController
  
}) {
  const { compactStepper, decisions, confirmations, setConfirmations, communities, toDelete, allConfirmed, cancel, next, back } = flow
  return (
                  <Box w="100%">
                    {!compactStepper && (
                      <>
                        <Title order={2} size="h4">
                          Communityへの影響
                        </Title>
                        <Divider my="md" />
                      </>
                    )}
                    <Stack gap="lg">
                      <Text size="sm" c="dimmed">
                        参加中のCommunityごとに、アカウント削除後の状態を確認してください。削除するCommunityでは確認のためCommunity名を入力します。
                      </Text>
                      <Badge
                        color={allConfirmed ? "green" : "yellow"}
                        variant="light"
                        w="fit-content"
                      >
                        {allConfirmed
                          ? "すべて確認済み"
                          : `未確認 ${toDelete.filter((item) => confirmations[item.id] !== item.name).length}件`}
                      </Badge>
                      {communities.map((community) => (
                        <Box
                          key={community.id}
                          p="md"
                          style={{
                            border:
                              "1px solid var(--mantine-color-default-border)",
                            borderRadius: "var(--mantine-radius-md)",
                          }}
                        >
                          <Stack gap="md">
                            <Group justify="space-between">
                              <Title order={3} size="h5">
                                {community.name}
                              </Title>
                              <Badge variant="light">
                                {community.relation !== "last-administrator"
                                  ? "退会"
                                  : decisions[community.id]?.choice === "delete"
                                    ? "削除"
                                    : "保持"}
                              </Badge>
                            </Group>
                            {decisions[community.id]?.choice === "delete" && (
                              <>
                                <Text size="sm">
                                  参加者：{community.members}人 /
                                  Community管理Media：{community.media}件
                                </Text>
                                <FeedbackAlert
                                  kind="error"
                                  title="このCommunityは復元できません"
                                >
                                  このCommunityと管理Mediaが削除されます。他のUserがアップロードしたMediaも削除されます。
                                </FeedbackAlert>
                                <TextInput
                                  label="確認のためCommunity名を入力"
                                  description={`「${community.name}」と入力してください。`}
                                  value={confirmations[community.id] ?? ""}
                                  onChange={(event) => {
                                    const value = event.currentTarget.value
                                    setConfirmations((previous) => ({
                                      ...previous,
                                      [community.id]: value,
                                    }))
                                  }}
                                  error={
                                    confirmations[community.id] &&
                                    confirmations[community.id] !==
                                      community.name
                                      ? "入力内容とCommunity名が一致していません"
                                      : undefined
                                  }
                                />
                              </>
                            )}
                            {community.relation !== "last-administrator" && (
                              <Text size="sm" c="dimmed">
                                アカウントを削除すると、このCommunityから退会します。Communityはそのまま残ります。
                              </Text>
                            )}
                            {community.relation === "last-administrator" &&
                              decisions[community.id]?.choice === "keep" && (
                                <Text size="sm" c="dimmed">
                                  Communityはそのまま残り、指定したAdministratorが管理を引き継ぎます。
                                </Text>
                              )}
                          </Stack>
                        </Box>
                      ))}
                      <Group gap="sm" justify="space-between">
                        <Box style={{ flex: 1 }}>
                          <Button size="sm" variant="default" onClick={back}>
                            戻る
                          </Button>
                        </Box>
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
                          <Button
                            size="sm"
                            disabled={!allConfirmed}
                            onClick={next}
                          >
                            次へ
                          </Button>
                        </Box>
                      </Group>
                    </Stack>
                  </Box>
  )
}
