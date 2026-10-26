import {
  Badge,
  Box,
  Button,
  Divider,
  Group,
  MultiSelect,
  Radio,
  Stack,
  Text,
  Title,
} from "@mantine/core"
import { FeedbackAlert } from "@/components/Feedback"
import type { AccountDeletionController } from "./useAccountDeletionController"
import type { Decision } from "./accountDeletionScenarios"

export function AccountDeletionResolutionStep({
  flow,
}: {
  flow: AccountDeletionController
}) {
  const {
    compactStepper,
    decisions,
    communities,
    communitiesToResolve,
    needsResolution,
    allResolved,
    cancel,
    next,
    back,
    changeDecision,
    resolved,
  } = flow
  return (
    <Box w="100%">
      {!compactStepper && (
        <>
          <Title order={2} size="h4">
            Communityへの対応
          </Title>
          <Divider my="md" />
        </>
      )}
      <Stack gap="lg">
        <Text size="sm" c="dimmed">
          参加中のCommunityごとに、アカウント削除時の対応を確認してください。必要なCommunityではAdministratorの指定または削除を選択します。
        </Text>
        {needsResolution && (
          <Badge
            color={allResolved ? "green" : "yellow"}
            variant="light"
            w="fit-content"
          >
            {allResolved
              ? "すべて解決済み"
              : `未解決 ${communitiesToResolve.filter((item) => !resolved(item.id)).length}件`}
          </Badge>
        )}
        {communities.map((community) => {
          const decision = decisions[community.id]
          const requiresDecision = community.relation === "last-administrator"
          return (
            <Box
              key={community.id}
              p="md"
              style={{
                border: "1px solid var(--mantine-color-default-border)",
                borderRadius: "var(--mantine-radius-md)",
              }}
            >
              <Stack gap="md">
                <Group justify="space-between">
                  <Title order={3} size="h5">
                    {community.name}
                  </Title>
                  {requiresDecision && (
                    <Badge
                      color={resolved(community.id) ? "green" : "yellow"}
                      variant="light"
                    >
                      {resolved(community.id) ? "解決済み" : "未解決"}
                    </Badge>
                  )}
                </Group>
                {!requiresDecision ? (
                  <FeedbackAlert kind="info" title="退会">
                    {community.relation === "member"
                      ? "このCommunityにはMemberとして参加しています。アカウントを削除すると、このCommunityから退会します。"
                      : "あなた以外にもAdministratorがいるため、Communityはそのまま残ります。アカウントを削除すると、このCommunityから退会します。"}
                  </FeedbackAlert>
                ) : (
                  <Text size="sm" c="dimmed">
                    あなた以外にAdministratorがいません。
                  </Text>
                )}
                {requiresDecision && (
                  <Radio.Group
                    label="このCommunityの対応"
                    value={decision?.choice ?? ""}
                    onChange={(value) =>
                      changeDecision(community.id, {
                        choice: value as Decision["choice"],
                        successors:
                          value === "keep" ? (decision?.successors ?? []) : [],
                      })
                    }
                  >
                    <Group align="stretch" grow mt="sm">
                      <Box
                        p="sm"
                        style={{
                          border: `1px solid ${
                            decision?.choice === "keep"
                              ? "var(--mantine-color-green-filled)"
                              : "var(--mantine-color-default-border)"
                          }`,
                          borderRadius: "var(--mantine-radius-md)",
                          background:
                            decision?.choice === "keep"
                              ? "var(--mantine-color-green-light)"
                              : undefined,
                        }}
                      >
                        <Radio
                          value="keep"
                          label="Communityを残す"
                          description={
                            community.candidates.length > 0
                              ? "別のMemberをAdministratorにすると、アカウント削除後もCommunityが残ります。"
                              : "Administratorに指定できるMemberがいないため、このCommunityを残すことはできません。"
                          }
                          disabled={community.candidates.length === 0}
                        />
                        <MultiSelect
                          mt="md"
                          label="後任のAdministrator"
                          placeholder={
                            community.candidates.length > 0
                              ? "Memberを検索して選択"
                              : "選択できるMemberがいません"
                          }
                          data={community.candidates}
                          value={decision?.successors ?? []}
                          onChange={(values) =>
                            changeDecision(community.id, {
                              choice: "keep",
                              successors: values,
                            })
                          }
                          searchable
                          clearable
                          disabled={
                            decision?.choice !== "keep" ||
                            community.candidates.length === 0
                          }
                        />
                      </Box>
                      <Box
                        p="sm"
                        style={{
                          border: `1px solid ${
                            decision?.choice === "delete"
                              ? "var(--mantine-color-red-filled)"
                              : "var(--mantine-color-default-border)"
                          }`,
                          borderRadius: "var(--mantine-radius-md)",
                          background:
                            decision?.choice === "delete"
                              ? "var(--mantine-color-red-light)"
                              : undefined,
                        }}
                      >
                        <Radio
                          value="delete"
                          label="Communityを削除する"
                          description="個人データへの影響は次のステップで確認します。"
                        />
                      </Box>
                    </Group>
                  </Radio.Group>
                )}
              </Stack>
            </Box>
          )
        })}
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
            <Button size="sm" variant="subtle" color="gray" onClick={cancel}>
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
            <Button size="sm" disabled={!allResolved} onClick={next}>
              次へ
            </Button>
          </Box>
        </Group>
      </Stack>
    </Box>
  )
}
