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
import { Fragment, type ComponentType, type PropsWithChildren } from "react"
import type { MockScenario } from "./accountDeletionGateway"
import { FeedbackAlert } from "@/components/Feedback"

import { labels, type Decision, type ReviewState, type CommunityScenario, type RetryOutcome } from "./accountDeletionScenarios"
import { useAccountDeletionController } from "./useAccountDeletionController"
export type { ReviewState, CommunityScenario, RetryOutcome } from "./accountDeletionScenarios"

export function AccountDeletionFlow({
  reviewState = "default",
  communityScenario = "mixed-memberships",
  retryOutcome = "success",
  mockScenario,
  prototype = false,
  onNavigateBack,
  shell: Shell = Fragment,
}: {
  reviewState?: ReviewState
  communityScenario?: CommunityScenario
  retryOutcome?: RetryOutcome
  mockScenario?: MockScenario
  prototype?: boolean
  onNavigateBack: () => void
  shell?: ComponentType<PropsWithChildren>
}) {
  const {
    resolved,
    setFlowError,
    step,
    setStep,
    compactStepper,
    loadState,
    setLoadState,
    decisions,
    confirmations,
    setConfirmations,
    cancelled,
    setCancelled,
    cancelConfirmationOpened,
    setCancelConfirmationOpened,
    reauth,
    setReauth,
    setGrant,
    setReview,
    busy,
    flowError,
    confirmed,
    setConfirmed,
    deletionPending,
    mediaCount,
    communities,
    communitiesToResolve,
    hasCommunities,
    needsResolution,
    allResolved,
    toDelete,
    allConfirmed,
    cancel,
    skipped,
    next,
    back,
    changeDecision,
    startReauthentication,
    confirmDeletion,
  } = useAccountDeletionController({
    reviewState,
    communityScenario,
    mockScenario,
    prototype,
    onNavigateBack,
  })
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
                if (prototype) setCancelled(true)
                else onNavigateBack()
              }}
            >
              中止する
            </Button>
          </Group>
        </Stack>
      </Modal>
      <Shell>
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
            {prototype && (cancelled || confirmed) ? (
              <Stack gap="md">
                <Title order={2} size="h4">
                  {confirmed ? "削除を確認しました（プロトタイプ）" : "削除手続きを中止しました"}
                </Title>
                <Text c="dimmed">
                  {confirmed ? "このプロトタイプではアカウントとデータは削除されません。" : "削除は開始されていません。"}
                </Text>
                <Button variant="default" size="sm" onClick={() => {
                  setCancelled(false)
                  setConfirmed(false)
                  setReauth(false)
                  setStep(0)
                }}>最初に戻る</Button>
              </Stack>
            ) : cancelled || confirmed || deletionPending ? (
              <Stack gap="lg" maw={600} mx="auto" w="100%" py="xl">
                {deletionPending ? (
                  <>
                    <Title order={2} size="h3">
                      削除リクエストを処理しています
                    </Title>
                    <Text c="dimmed">
                      アカウント削除の受付結果を確認しています。画面を閉じずにお待ちください。
                    </Text>
                    <Button loading disabled>
                      処理中
                    </Button>
                  </>
                ) : confirmed ? (
                  <>
                    <Title order={2} size="h3">
                      {mockScenario
                        ? "確認フローが完了しました"
                        : "アカウント削除を受け付けました"}
                    </Title>
                    <FeedbackAlert
                      kind="info"
                      title={
                        mockScenario
                          ? "確認が完了しました"
                          : "アカウントの利用は終了しました"
                      }
                    >
                      {mockScenario
                        ? "確認手続きが終了しました。"
                        : "アカウントは利用できなくなりました。対象データの削除はバックグラウンドで進みます。"}
                    </FeedbackAlert>
                    {mockScenario && (
                      <Button
                        variant="default"
                        onClick={() => {
                          setCancelled(false)
                          setConfirmed(false)
                          setReauth(false)
                          setReview(null)
                          setGrant(null)
                          setFlowError(null)
                          setStep(0)
                        }}
                      >
                        最初から確認する
                      </Button>
                    )}
                  </>
                ) : (
                  <>
                    <Title order={2} size="h4">
                      削除手続きを中止しました
                    </Title>
                    <Text c="dimmed">削除は開始されていません。</Text>
                    <Button
                      variant="default"
                      onClick={() => {
                        setCancelled(false)
                        setStep(0)
                      }}
                    >
                      最初に戻る
                    </Button>
                  </>
                )}
              </Stack>
            ) : (
              <>
                <Box
                  style={{
                    position: "sticky",
                    top: 0,
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
                            skipped(index) && step > index ? "gray" : undefined
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
                                  : decisions[community.id]?.choice === "delete"
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
                      {flowError && (
                        <FeedbackAlert
                          kind="error"
                          title="処理を完了できませんでした"
                        >
                          {flowError}
                        </FeedbackAlert>
                      )}
                      {reauth && (
                        <FeedbackAlert
                          kind="info"
                          title={prototype ? "再認証（プロトタイプ）" : "再認証済み"}
                        >
                          {prototype
                            ? "実際のAuth0認証は行いません。削除処理も実行されません。"
                            : "削除を確定する前に、内容をもう一度確認してください。"}
                        </FeedbackAlert>
                      )}
                      <Group gap="sm" justify="space-between">
                        <Box style={{ flex: 1 }}>
                          <Button
                            size="sm"
                            variant="default"
                            onClick={() => {
                              setReauth(false)
                              setGrant(null)
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
                            color={reauth ? "red" : undefined}
                            loading={busy}
                            onClick={() =>
                              prototype
                                ? reauth
                                  ? setConfirmed(true)
                                  : next()
                                : reauth
                                  ? void confirmDeletion()
                                  : void startReauthentication()
                            }
                          >
                            {reauth ? "アカウントを削除する" : "再認証する"}
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
      </Shell>
    </>
  )
}
