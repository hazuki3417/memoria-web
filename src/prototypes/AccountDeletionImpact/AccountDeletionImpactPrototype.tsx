"use client"

import {
  Badge,
  Box,
  Button,
  Divider,
  Group,
  Modal,
  MultiSelect,
  Radio,
  Stack,
  Stepper,
  Text,
  TextInput,
  Title,
} from "@mantine/core"
import { useMediaQuery } from "@mantine/hooks"
import { useState } from "react"
import { FeedbackAlert } from "@/components/Feedback"
import { getApplicationNavigation } from "@/components/ApplicationShell"
import { PrototypeApplicationShell } from "@/prototypes/PrototypeApplicationShell"

const personalContext = { id: "personal", kind: "personal" as const, label: "Personal", accentColor: "var(--mantine-color-blue-6)" }

type ReviewState = "default" | "empty" | "failure" | "retrying"
type CommunityScenario =
  | "mixed-memberships"
  | "no-communities"
  | "member-only"
  | "administrator-with-others-only"
  | "withdrawal-mixed"
  | "last-administrator"
  | "last-administrator-no-candidate"
  | "multiple-last-administrators"
type RetryOutcome = "success" | "failure"
type Decision = { choice: "keep" | "delete" | null; successors: string[] }
type CommunityFixture = {
  id: string
  name: string
  members: number
  media: number
  relation: "member" | "administrator-with-others" | "last-administrator"
  candidates: { value: string; label: string }[]
}
const resolutionCommunities: CommunityFixture[] = [
  {
    id: "family",
    name: "家族のアルバム",
    members: 5,
    media: 128,
    relation: "last-administrator",
    candidates: [
      { value: "a", label: "山田 花子" },
      { value: "b", label: "山田 太郎" },
    ],
  },
  {
    id: "travel",
    name: "旅行の思い出",
    members: 1,
    media: 42,
    relation: "last-administrator",
    candidates: [],
  },
  {
    id: "friends",
    name: "友人との記録",
    members: 4,
    media: 36,
    relation: "last-administrator",
    candidates: [{ value: "c", label: "佐藤 葵" }],
  },
]

const withdrawalCommunities: CommunityFixture[] = [
  {
    id: "club",
    name: "写真クラブ",
    members: 8,
    media: 64,
    relation: "member",
    candidates: [],
  },
  {
    id: "school",
    name: "同窓会",
    members: 12,
    media: 91,
    relation: "administrator-with-others",
    candidates: [],
  },
]
const communitiesForScenario = (
  scenario: CommunityScenario,
): CommunityFixture[] => {
  if (scenario === "no-communities") return []
  if (scenario === "member-only") return [withdrawalCommunities[0]]
  if (scenario === "administrator-with-others-only")
    return [withdrawalCommunities[1]]
  if (scenario === "withdrawal-mixed") return withdrawalCommunities
  if (scenario === "last-administrator") return [resolutionCommunities[0]]
  if (scenario === "last-administrator-no-candidate")
    return [resolutionCommunities[1]]
  if (scenario === "multiple-last-administrators") return resolutionCommunities
  return [resolutionCommunities[0], ...withdrawalCommunities]
}
const labels = [
  "個人データへの影響",
  "Communityへの対応",
  "Communityへの影響",
  "最終確認",
]
export function AccountDeletionImpactPrototype({
  reviewState = "default",
  communityScenario = "mixed-memberships",
  retryOutcome = "success",
}: {
  reviewState?: ReviewState
  communityScenario?: CommunityScenario
  retryOutcome?: RetryOutcome
}) {
  const [step, setStep] = useState(0)
  const compactStepper = useMediaQuery("(max-width: 48em)")
  const [loadState, setLoadState] = useState<"ready" | "failed" | "retrying">(
    reviewState === "failure"
      ? "failed"
      : reviewState === "retrying"
        ? "retrying"
        : "ready",
  )
  const [decisions, setDecisions] = useState<Record<string, Decision>>({})
  const [confirmations, setConfirmations] = useState<Record<string, string>>({})
  const [cancelled, setCancelled] = useState(false)
  const [cancelConfirmationOpened, setCancelConfirmationOpened] =
    useState(false)
  const [reauth, setReauth] = useState(false)
  const [confirmed, setConfirmed] = useState(false)
  const mediaCount = reviewState === "empty" ? 0 : 24
  const communities = communitiesForScenario(communityScenario)
  const communitiesToResolve = communities.filter(
    (community) => community.relation === "last-administrator",
  )
  const _communitiesToWithdraw = communities.filter(
    (community) => community.relation !== "last-administrator",
  )
  const hasCommunities = communities.length > 0
  const needsResolution = communitiesToResolve.length > 0
  const resolved = (id: string) => {
    const decision = decisions[id]
    const community = communities.find((item) => item.id === id)
    return (
      decision?.choice === "delete" ||
      (decision?.choice === "keep" &&
        decision.successors.length > 0 &&
        decision.successors.every((successor) =>
          community?.candidates.some(
            (candidate) => candidate.value === successor,
          ),
        ))
    )
  }
  const allResolved = communitiesToResolve.every((item) => resolved(item.id))
  const toDelete = communitiesToResolve.filter(
    (item) => decisions[item.id]?.choice === "delete",
  )
  const allConfirmed = toDelete.every(
    (item) => confirmations[item.id] === item.name,
  )
  const hasPendingChanges =
    Object.keys(decisions).length > 0 ||
    Object.values(confirmations).some((value) => value.length > 0)
  const cancel = () => {
    if (hasPendingChanges) {
      setCancelConfirmationOpened(true)
      return
    }
    setCancelled(true)
  }
  const skipped = (index: number) =>
    (index === 1 && !hasCommunities) || (index === 2 && !hasCommunities)
  const next = () => {
    if (step === 0) setStep(hasCommunities ? 1 : 3)
    if (step === 1 && allResolved) setStep(2)
    if (step === 2 && allConfirmed) setStep(3)
    if (step === 3) setReauth(true)
  }
  const back = () => {
    if (step === 3) setStep(hasCommunities ? 2 : 0)
    if (step === 2) setStep(1)
    if (step === 1) setStep(0)
  }
  const changeDecision = (id: string, decision: Decision) => {
    setDecisions((previous) => ({ ...previous, [id]: decision }))
    setConfirmations((previous) => ({ ...previous, [id]: "" }))
  }
  return (
    <>
      <Modal
        opened={cancelConfirmationOpened}
        onClose={() => setCancelConfirmationOpened(false)}
        title="アカウント削除を中止しますか？"
        centered
      >
        <Stack gap="lg">
          <Text size="sm">
            Communityへの対応など、この画面で行った変更は保存されません。
          </Text>
          <Group justify="flex-end">
            <Button
              variant="default"
              onClick={() => setCancelConfirmationOpened(false)}
            >
              確認を続ける
            </Button>
            <Button
              onClick={() => {
                setCancelConfirmationOpened(false)
                setCancelled(true)
              }}
            >
              中止する
            </Button>
          </Group>
        </Stack>
      </Modal>
      <PrototypeApplicationShell
        currentContext={personalContext}
        contexts={[personalContext]}
        navigationItems={getApplicationNavigation({ contextKind: "personal" })}
      >
          <Box maw={960} mx="auto" w="100%">
            <Stack gap="xl">
              <Box>
                <Title order={1} size="h2">
                  アカウント削除
                </Title>
                <Text c="dimmed" size="sm" mt={4}>
                  アカウントを削除した場合の影響と、削除前に必要な対応を確認します。
                </Text>
              </Box>
              {cancelled || confirmed ? (
                <Stack gap="md">
                  <Title order={2} size="h4">
                    {confirmed
                      ? "削除を確認しました（プロトタイプ）"
                      : "削除手続きを中止しました"}
                  </Title>
                  <Text c="dimmed">
                    {confirmed
                      ? "このプロトタイプではアカウントとデータは削除されません。"
                      : "削除は開始されていません。"}
                  </Text>
                  <Button
                    variant="default"
                    size="sm"
                    onClick={() => {
                      setCancelled(false)
                      setConfirmed(false)
                      setReauth(false)
                      setStep(0)
                    }}
                  >
                    最初に戻る
                  </Button>
                </Stack>
              ) : (
                <>
                  <Box
                    style={{
                      position: "sticky",
                      top: 40,
                      zIndex: 10,
                      background: "var(--mantine-color-body)",
                      borderBottom:
                        "1px solid var(--mantine-color-default-border)",
                      paddingTop: 12,
                      paddingBottom: 12,
                    }}
                  >
                    {compactStepper ? (
                      <Stack gap={4}>
                        <Text size="xs" c="dimmed">
                          ステップ {step + 1}/4
                        </Text>
                        <Text fw={600}>{labels[step]}</Text>
                        <Text size="xs" c="dimmed">
                          {labels
                            .map((label, index) =>
                              skipped(index) && step > index
                                ? `${label}：対象なし`
                                : null,
                            )
                            .filter(Boolean)
                            .join(" / ")}
                        </Text>
                      </Stack>
                    ) : (
                      <Stepper
                        active={step}
                        allowNextStepsSelect={false}
                        size="sm"
                        orientation="horizontal"
                      >
                        {labels.map((label, index) => (
                          <Stepper.Step
                            key={label}
                            label={label}
                            description={
                              skipped(index) && step > index
                                ? "対象なし"
                                : index === step
                                  ? "確認中"
                                  : undefined
                            }
                            completedIcon={
                              skipped(index) ? (
                                <Text size="xs">—</Text>
                              ) : undefined
                            }
                            color={
                              skipped(index) && step > index
                                ? "gray"
                                : undefined
                            }
                          />
                        ))}
                      </Stepper>
                    )}
                  </Box>
                  {step === 0 && (
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
                        <Group gap="sm" justify="flex-end">
                          <Box
                            style={{
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
                  )}
                  {step === 1 && (
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
                          const requiresDecision =
                            community.relation === "last-administrator"
                          return (
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
                                  {requiresDecision && (
                                    <Badge
                                      color={
                                        resolved(community.id)
                                          ? "green"
                                          : "yellow"
                                      }
                                      variant="light"
                                    >
                                      {resolved(community.id)
                                        ? "解決済み"
                                        : "未解決"}
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
                                          value === "keep"
                                            ? (decision?.successors ?? [])
                                            : [],
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
                                          borderRadius:
                                            "var(--mantine-radius-md)",
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
                                          disabled={
                                            community.candidates.length === 0
                                          }
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
                                          borderRadius:
                                            "var(--mantine-radius-md)",
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
                            <Button
                              size="sm"
                              variant="subtle"
                              color="gray"
                              onClick={cancel}
                            >
                              キャンセル
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
                              disabled={!allResolved}
                              onClick={next}
                            >
                              次へ
                            </Button>
                          </Box>
                        </Group>
                      </Stack>
                    </Box>
                  )}
                  {step === 2 && (
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
                                    : decisions[community.id]?.choice ===
                                        "delete"
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
                              キャンセル
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
                  )}
                  {step === 3 && (
                    <Box w="100%">
                      {!compactStepper && (
                        <>
                          <Title order={2} size="h4">
                            最終確認
                          </Title>
                          <Divider my="md" />
                        </>
                      )}
                      <Stack gap="lg">
                        <Box>
                          <Title order={3} size="h5">
                            アカウントとMedia
                          </Title>
                          <Text size="sm">
                            アカウントおよび管理Media {mediaCount}
                            件を削除します。
                          </Text>
                        </Box>
                        <Box>
                          <Title order={3} size="h5">
                            Communityへの対応
                          </Title>
                          {!needsResolution && (
                            <FeedbackAlert
                              kind="info"
                              title="Communityの管理状態を変更する必要はありません"
                            >
                              {communities.length === 0
                                ? "参加中のCommunityはありません。管理状態の解消と削除対象の確認は省略しました。"
                                : "最後のAdministratorであるCommunityはありません。参加中のCommunityからはアカウント削除時に退会します。管理状態の解消と削除対象の確認は省略しました。"}
                            </FeedbackAlert>
                          )}
                          {needsResolution && toDelete.length === 0 && (
                            <FeedbackAlert
                              kind="info"
                              title="削除するCommunityはありません"
                            >
                              削除対象の確認は、対象がないため省略しました。
                            </FeedbackAlert>
                          )}
                          {communities.length > 0 && (
                            <Stack
                              gap={0}
                              mt="sm"
                              style={{
                                border:
                                  "1px solid var(--mantine-color-default-border)",
                                borderRadius: "var(--mantine-radius-md)",
                                overflow: "hidden",
                              }}
                            >
                              {communities.map((community, index) => {
                                const action =
                                  community.relation !== "last-administrator"
                                    ? "leave"
                                    : decisions[community.id]?.choice ===
                                        "delete"
                                      ? "delete"
                                      : "keep"
                                const successors = (
                                  decisions[community.id]?.successors ?? []
                                )
                                  .map(
                                    (successor) =>
                                      community.candidates.find(
                                        (candidate) =>
                                          candidate.value === successor,
                                      )?.label,
                                  )
                                  .filter(Boolean)
                                  .join("、")

                                return (
                                  <Group
                                    key={community.id}
                                    gap="md"
                                    px="sm"
                                    py="xs"
                                    wrap="nowrap"
                                    style={{
                                      borderTop:
                                        index > 0
                                          ? "1px solid var(--mantine-color-default-border)"
                                          : undefined,
                                    }}
                                  >
                                    <Box style={{ flex: 1, minWidth: 0 }}>
                                      <Text size="sm" fw={500} truncate>
                                        {community.name}
                                      </Text>
                                      <Text size="xs" c="dimmed" truncate>
                                        {action === "delete"
                                          ? "Communityと管理Mediaを削除"
                                          : action === "keep"
                                            ? `Administrator → ${successors || "未指定"}`
                                            : "Communityから退会・Communityは保持"}
                                      </Text>
                                    </Box>
                                    <Badge
                                      size="sm"
                                      variant="light"
                                      color={
                                        action === "delete"
                                          ? "red"
                                          : action === "keep"
                                            ? "green"
                                            : "gray"
                                      }
                                    >
                                      {action === "delete"
                                        ? "削除"
                                        : action === "keep"
                                          ? "保持"
                                          : "退会"}
                                    </Badge>
                                  </Group>
                                )
                              })}
                            </Stack>
                          )}
                        </Box>
                        <FeedbackAlert
                          kind="error"
                          title="アカウントと削除対象のデータは復元できません"
                        >
                          削除を続けるには再認証が必要です。
                        </FeedbackAlert>
                        {reauth && (
                          <FeedbackAlert
                            kind="info"
                            title="再認証（プロトタイプ）"
                          >
                            実際のAuth0認証は行いません。削除処理も実行されません。
                          </FeedbackAlert>
                        )}
                        <Group gap="sm" justify="space-between">
                          <Box style={{ flex: 1 }}>
                            <Button
                              size="sm"
                              variant="default"
                              onClick={() => {
                                setReauth(false)
                                back()
                              }}
                            >
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
                              キャンセル
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
                              color={reauth ? "red" : undefined}
                              onClick={() =>
                                reauth ? setConfirmed(true) : next()
                              }
                            >
                              {reauth
                                ? "アカウントを削除する（デモ）"
                                : "再認証する（デモ）"}
                            </Button>
                          </Box>
                        </Group>
                      </Stack>
                    </Box>
                  )}
                </>
              )}
            </Stack>
          </Box>
      </PrototypeApplicationShell>
    </>
  )
}
