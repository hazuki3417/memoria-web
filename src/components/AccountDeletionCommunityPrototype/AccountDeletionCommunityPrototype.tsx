"use client"

import {
  AppShell,
  Badge,
  Box,
  Button,
  Divider,
  Group,
  Radio,
  Select,
  Stack,
  Stepper,
  Text,
  TextInput,
  Title,
} from "@mantine/core"
import { useState } from "react"
import { PrototypeFormAlert } from "../PrototypeFeedback/PrototypeFeedback"

type Choice = "keep" | "delete"
type Community = {
  id: string
  name: string
  members: number
  media: number
  candidates: { value: string; label: string }[]
}
type Decision = { choice: Choice | null; successor: string | null }

const communities: Community[] = [
  {
    id: "family",
    name: "家族のアルバム",
    members: 5,
    media: 128,
    candidates: [
      { value: "member-a", label: "山田 花子" },
      { value: "member-b", label: "山田 太郎" },
    ],
  },
  {
    id: "travel",
    name: "旅行の思い出",
    members: 1,
    media: 42,
    candidates: [],
  },
  {
    id: "friends",
    name: "友人との記録",
    members: 4,
    media: 36,
    candidates: [{ value: "member-c", label: "佐藤 葵" }],
  },
]

type Scenario = "default" | "all-keep" | "all-delete" | "no-successor" | "load-failed"
const initialDecisions = (scenario: Scenario): Record<string, Decision> =>
  Object.fromEntries(
    communities.map((community) => [
      community.id,
      scenario === "all-delete"
        ? { choice: "delete", successor: null }
        : scenario === "all-keep" && community.candidates.length > 0
          ? { choice: "keep", successor: community.candidates[0].value }
          : { choice: null, successor: null },
    ]),
  )

export function AccountDeletionCommunityPrototype({
  scenario = "default",
}: {
  scenario?: Scenario
}) {
  const items =
    scenario === "no-successor"
      ? communities.filter((community) => community.candidates.length === 0)
      : scenario === "all-keep"
        ? communities.filter((community) => community.candidates.length > 0)
        : communities
  const [step, setStep] = useState(0)
  const [decisions, setDecisions] = useState<Record<string, Decision>>(
    () => initialDecisions(scenario),
  )
  const [confirmations, setConfirmations] = useState<Record<string, string>>({})
  const [loadFailed, setLoadFailed] = useState(scenario === "load-failed")
  const [destination, setDestination] = useState<
    "impact" | "final-review" | "cancelled" | null
  >(null)

  const setDecision = (id: string, decision: Decision) => {
    setDecisions((previous) => ({ ...previous, [id]: decision }))
    setConfirmations((previous) => ({ ...previous, [id]: "" }))
  }
  const resolved = (community: Community) => {
    const decision = decisions[community.id]
    return (
      decision?.choice === "delete" ||
      (decision?.choice === "keep" &&
        community.candidates.some((candidate) => candidate.value === decision.successor))
    )
  }
  const allResolved = items.every(resolved)
  const toDelete = items.filter(
    (community) => decisions[community.id]?.choice === "delete",
  )
  const allConfirmed = toDelete.every(
    (community) => confirmations[community.id] === community.name,
  )
  const continueFromResolution = () => {
    if (!allResolved || loadFailed) return
    if (toDelete.length === 0) {
      setDestination("final-review")
    } else {
      setStep(1)
    }
  }

  return (
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
            {destination !== null ? (
              <Stack gap="md" maw={600}>
                <Title order={1} size="h2">
                  {destination === "impact"
                    ? "アカウント削除：影響確認"
                    : destination === "cancelled"
                      ? "削除手続きを中止しました"
                      : "削除内容の最終確認"}
                </Title>
                <Text c="dimmed">
                  {destination === "impact"
                    ? "前の画面へ戻る想定です。このStoryでは遷移先をプレースホルダーで表現します。"
                    : destination === "cancelled"
                      ? "削除は開始されていません。"
                      : "Communityへの対応が完了しました。後続画面の試作は別途行います。"}
                </Text>
                <Button variant="default" size="sm" onClick={() => setDestination(null)}>
                  戻る
                </Button>
              </Stack>
            ) : (
              <>
                <Box>
                  <Title order={1} size="h2">Communityへの影響</Title>
                  <Text c="dimmed" size="sm" mt={4}>
                    アカウント削除に伴うCommunityの対応を確認してください。
                  </Text>
                </Box>
                <Stepper active={step} allowNextStepsSelect={false} size="sm">
                  <Stepper.Step label="管理状態の解消" description="Communityごとの対応を選択" />
                  <Stepper.Step label="削除対象の確認" description="削除するCommunityのみ" />
                </Stepper>
                {step === 0 ? (
                  <Box>
                    <Title order={2} size="h4">対応が必要なCommunity</Title>
                    <Divider my="md" />
                    <Stack gap="lg" maw={600}>
                      <Text size="sm" c="dimmed">
                        あなたが最後のAdministratorであるCommunityについて、
                        後任の指定または削除を選択してください。
                      </Text>
                      {!loadFailed && (
                        <Badge color={allResolved ? "green" : "yellow"} variant="light">
                          {allResolved ? "すべて解決済み" : `未解決 ${items.filter((item) => !resolved(item)).length}件`}
                        </Badge>
                      )}
                      {loadFailed ? (
                        <PrototypeFormAlert kind="error" title="Communityの情報を取得できませんでした">
                          判断に必要な情報を確認できません。再試行してください。
                        </PrototypeFormAlert>
                      ) : (
                        items.map((community) => {
                          const decision = decisions[community.id]
                          return (
                            <Box key={community.id} p="md" style={{ border: "1px solid var(--mantine-color-default-border)", borderRadius: "var(--mantine-radius-md)" }}>
                              <Stack gap="md">
                                <Group justify="space-between" align="center">
                                  <Title order={3} size="h5">{community.name}</Title>
                                  <Badge color={resolved(community) ? "green" : "yellow"} variant="light">
                                    {resolved(community) ? "解決済み" : "未解決"}
                                  </Badge>
                                </Group>
                                <Text size="sm" c="dimmed">あなたが最後のAdministratorです。</Text>
                                <Radio.Group
                                  label="このCommunityの対応"
                                  value={decision?.choice ?? ""}
                                  onChange={(value) =>
                                    setDecision(community.id, {
                                      choice: value as Choice,
                                      successor: value === "keep" ? decision?.successor ?? null : null,
                                    })
                                  }
                                >
                                  <Stack mt="sm" gap="md">
                                    {community.candidates.length > 0 ? (
                                      <Box p="sm" style={{ border: "1px solid var(--mantine-color-default-border)", borderRadius: "var(--mantine-radius-md)" }}>
                                        <Radio value="keep" label="Communityを保持する" description="別のMemberをAdministratorに指定します。" />
                                        {decision?.choice === "keep" && (
                                          <Select
                                            mt="md"
                                            label="後任のAdministrator"
                                            placeholder="Memberを選択"
                                            data={community.candidates}
                                            value={decision.successor}
                                            onChange={(value) =>
                                              setDecision(community.id, { choice: "keep", successor: value })
                                            }
                                            clearable
                                          />
                                        )}
                                      </Box>
                                    ) : (
                                      <PrototypeFormAlert kind="info" title="後任にできるMemberがいません">
                                        このCommunityは保持できません。削除を選択してください。
                                      </PrototypeFormAlert>
                                    )}
                                    <Box p="sm" style={{ border: "1px solid var(--mantine-color-default-border)", borderRadius: "var(--mantine-radius-md)" }}>
                                      <Radio value="delete" label="Communityを削除する" description="削除による影響は次の段階で確認します。" />
                                    </Box>
                                  </Stack>
                                </Radio.Group>
                              </Stack>
                            </Box>
                          )
                        })
                      )}
                      <Group gap="sm">
                        {loadFailed ? (
                          <Button size="sm" onClick={() => setLoadFailed(false)}>再試行</Button>
                        ) : (
                          <Button size="sm" disabled={!allResolved} onClick={continueFromResolution}>
                            {toDelete.length === 0 ? "最終確認へ" : "次へ"}
                          </Button>
                        )}
                        <Button size="sm" variant="default" onClick={() => setDestination("impact")}>戻る</Button>
                        <Button size="sm" variant="subtle" color="gray" onClick={() => setDestination("cancelled")}>キャンセル</Button>
                      </Group>
                    </Stack>
                  </Box>
                ) : (
                  <Box>
                    <Title order={2} size="h4">削除対象の確認</Title>
                    <Divider my="md" />
                    <Stack gap="lg" maw={600}>
                      <Text size="sm" c="dimmed">
                        削除するCommunityとその影響を確認し、各Community名を入力してください。
                      </Text>
                      <Badge color={allConfirmed ? "green" : "yellow"} variant="light">
                        {allConfirmed ? "すべて確認済み" : `未確認 ${toDelete.filter((item) => confirmations[item.id] !== item.name).length}件`}
                      </Badge>
                      {toDelete.map((community) => (
                        <Box key={community.id} p="md" style={{ border: "1px solid var(--mantine-color-default-border)", borderRadius: "var(--mantine-radius-md)" }}>
                          <Stack gap="md">
                            <Group justify="space-between">
                              <Title order={3} size="h5">{community.name}</Title>
                              <Badge color={confirmations[community.id] === community.name ? "green" : "yellow"} variant="light">
                                {confirmations[community.id] === community.name ? "確認済み" : "未確認"}
                              </Badge>
                            </Group>
                            <Text size="sm">参加者：{community.members}人 / Community管理Media：{community.media}件</Text>
                            <PrototypeFormAlert kind="error" title="削除したCommunityは復元できません">
                              他のUserがアップロードしたMediaも含め、このCommunityと管理Mediaが削除されます。
                            </PrototypeFormAlert>
                            <TextInput
                              label="確認のためCommunity名を入力"
                              description={`「${community.name}」と入力してください。`}
                              value={confirmations[community.id] ?? ""}
                              onChange={(event) =>
                                setConfirmations((previous) => ({
                                  ...previous,
                                  [community.id]: event.currentTarget.value,
                                }))
                              }
                              error={
                                confirmations[community.id] &&
                                confirmations[community.id] !== community.name
                                  ? "Community名が一致しません"
                                  : undefined
                              }
                            />
                          </Stack>
                        </Box>
                      ))}
                      <Group gap="sm">
                        <Button size="sm" disabled={!allConfirmed} onClick={() => setDestination("final-review")}>最終確認へ</Button>
                        <Button size="sm" variant="default" onClick={() => setStep(0)}>戻る</Button>
                        <Button size="sm" variant="subtle" color="gray" onClick={() => setDestination("cancelled")}>キャンセル</Button>
                      </Group>
                    </Stack>
                  </Box>
                )}
              </>
            )}
          </Stack>
        </Box>
      </AppShell.Main>
    </AppShell>
  )
}
