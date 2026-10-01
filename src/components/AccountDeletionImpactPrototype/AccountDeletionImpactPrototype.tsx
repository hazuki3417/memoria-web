"use client"

import { AppShell, Badge, Box, Button, Divider, Group, Radio, Select, Stack, Stepper, Text, TextInput, Title } from "@mantine/core"
import { useState } from "react"
import { PrototypeFormAlert } from "../PrototypeFeedback/PrototypeFeedback"

type ReviewState = "default" | "empty" | "failure" | "retrying"
type CommunityScenario = "requires-resolution" | "no-resolution"
type RetryOutcome = "success" | "failure"
type Decision = { choice: "keep" | "delete" | null; successor: string | null }
const communities = [
  { id: "family", name: "家族のアルバム", members: 5, media: 128, candidates: [{ value: "a", label: "山田 花子" }, { value: "b", label: "山田 太郎" }] },
  { id: "travel", name: "旅行の思い出", members: 1, media: 42, candidates: [] },
  { id: "friends", name: "友人との記録", members: 4, media: 36, candidates: [{ value: "c", label: "佐藤 葵" }] },
]
const labels = ["削除されるデータ", "管理状態の解消", "削除対象の確認", "最終確認"]
export function AccountDeletionImpactPrototype({
  reviewState = "default",
  communityScenario = "requires-resolution",
  retryOutcome = "success",
}: {
  reviewState?: ReviewState
  communityScenario?: CommunityScenario
  retryOutcome?: RetryOutcome
}) {
  const [step, setStep] = useState(0)
  const [loadState, setLoadState] = useState<"ready" | "failed" | "retrying">(
    reviewState === "failure" ? "failed" : reviewState === "retrying" ? "retrying" : "ready",
  )
  const [decisions, setDecisions] = useState<Record<string, Decision>>({})
  const [confirmations, setConfirmations] = useState<Record<string, string>>({})
  const [cancelled, setCancelled] = useState(false)
  const [reauth, setReauth] = useState(false)
  const [confirmed, setConfirmed] = useState(false)
  const mediaCount = reviewState === "empty" ? 0 : 24
  const needsResolution = communityScenario === "requires-resolution"
  const resolved = (id: string) => {
    const decision = decisions[id]
    const community = communities.find((item) => item.id === id)
    return decision?.choice === "delete" || (decision?.choice === "keep" && community?.candidates.some((candidate) => candidate.value === decision.successor))
  }
  const allResolved = communities.every((item) => resolved(item.id))
  const toDelete = communities.filter((item) => decisions[item.id]?.choice === "delete")
  const allConfirmed = toDelete.every((item) => confirmations[item.id] === item.name)
  const skipped = (index: number) =>
    (index === 1 && !needsResolution) ||
    (index === 2 && (!needsResolution || (allResolved && toDelete.length === 0)))
  const next = () => {
    if (step === 0) setStep(needsResolution ? 1 : 3)
    if (step === 1 && allResolved) setStep(toDelete.length > 0 ? 2 : 3)
    if (step === 2 && allConfirmed) setStep(3)
    if (step === 3) setReauth(true)
  }
  const back = () => {
    if (step === 3) setStep(!needsResolution ? 0 : toDelete.length > 0 ? 2 : 1)
    if (step === 2) setStep(1)
    if (step === 1) setStep(0)
  }
  const changeDecision = (id: string, decision: Decision) => {
    setDecisions((previous) => ({ ...previous, [id]: decision }))
    setConfirmations((previous) => ({ ...previous, [id]: "" }))
  }
  return (
    <AppShell header={{ height: 40 }} padding="lg">
      <AppShell.Header>
        <Group h="100%" px="md" gap="sm">
          <Text fw={750} size="lg">Memoria</Text>
          <Text c="dimmed" size="sm">/</Text>
          <Text size="sm">Personal</Text>
        </Group>
      </AppShell.Header>
      <AppShell.Main>
        <Box maw={960} mx="auto" w="100%">
          <Stack gap="xl">
            <Box>
              <Title order={1} size="h2">アカウント削除</Title>
              <Text c="dimmed" size="sm" mt={4}>削除による影響と必要な対応を順番に確認してください。</Text>
            </Box>
            {cancelled || confirmed ? (
              <Stack gap="md" maw={600}>
                <Title order={2} size="h4">{confirmed ? "削除手続きの確認（プロトタイプ）" : "削除手続きを中止しました"}</Title>
                <Text c="dimmed">{confirmed ? "実際の再認証や削除処理は行っていません。" : "削除は開始されていません。"}</Text>
                <Button variant="default" size="sm" onClick={() => { setCancelled(false); setConfirmed(false); setReauth(false); setStep(0) }}>最初に戻る</Button>
              </Stack>
            ) : (
              <>
                <Stepper active={step} allowNextStepsSelect={false} size="sm" orientation="horizontal">
                  {labels.map((label, index) => (
                    <Stepper.Step
                      key={label}
                      label={label}
                      description={skipped(index) && step > index ? "対象なし" : index === step ? "確認中" : undefined}
                      completedIcon={skipped(index) ? <Text size="xs">—</Text> : undefined}
                      color={skipped(index) && step > index ? "gray" : undefined}
                    />
                  ))}
                </Stepper>
                {step === 0 && (
                  <Box maw={600}>
                    <Title order={2} size="h4">削除されるデータ</Title>
                    <Divider my="md" />
                    <Stack gap="lg">
                      {loadState === "ready" ? (
                        <Box>
                          <Text c="dimmed" size="sm">削除対象のMedia</Text>
                          {mediaCount === 0 ? <Text mt={4}>削除対象のMediaはありません</Text> : <Title order={3} size="h2" mt={4}>{mediaCount}件</Title>}
                        </Box>
                      ) : (
                        <PrototypeFormAlert kind={loadState === "retrying" ? "info" : "error"} title={loadState === "retrying" ? "削除対象のMediaを確認しています" : "削除の影響を確認できませんでした"}>
                          {loadState === "retrying" ? "Mediaの件数を再取得しています。" : "Mediaの件数を取得できませんでした。もう一度お試しください。"}
                        </PrototypeFormAlert>
                      )}
                      <Box>
                        <Title order={2} size="h4">注意事項</Title>
                        <Divider my="md" />
                        <PrototypeFormAlert kind="error" title="削除したデータは復元できません">アカウントと、あなたが管理するMediaが削除されます。</PrototypeFormAlert>
                      </Box>
                      {loadState === "ready" && <Text c="dimmed" size="sm">Communityへの影響は、後続のステップで確認します。対応が不要なステップは自動的に省略します。</Text>}
                      <Group gap="sm" justify="space-between">
                        <Button size="sm" variant="default" onClick={() => setCancelled(true)}>キャンセル</Button>
                        {loadState !== "ready" ? (
                          <Button size="sm" loading={loadState === "retrying"} disabled={loadState === "retrying"} onClick={() => setLoadState("retrying")}>再試行</Button>
                        ) : <Button size="sm" onClick={next}>次へ</Button>}
                      </Group>
                      {loadState === "retrying" && <Button size="xs" variant="light" onClick={() => setLoadState(retryOutcome === "success" ? "ready" : "failed")}>再取得を完了</Button>}
                    </Stack>
                  </Box>
                )}
                {step === 1 && (
                  <Box maw={600}>
                    <Title order={2} size="h4">管理状態の解消</Title>
                    <Divider my="md" />
                    <Stack gap="lg">
                      <Text size="sm" c="dimmed">最後のAdministratorであるCommunityごとに、後任の指定または削除を選択してください。</Text>
                      <Badge color={allResolved ? "green" : "yellow"} variant="light" w="fit-content">{allResolved ? "すべて解決済み" : `未解決 ${communities.filter((item) => !resolved(item.id)).length}件`}</Badge>
                      {communities.map((community) => {
                        const decision = decisions[community.id]
                        return (
                          <Box key={community.id} p="md" style={{ border: "1px solid var(--mantine-color-default-border)", borderRadius: "var(--mantine-radius-md)" }}>
                            <Stack gap="md">
                              <Group justify="space-between">
                                <Title order={3} size="h5">{community.name}</Title>
                                <Badge color={resolved(community.id) ? "green" : "yellow"} variant="light">{resolved(community.id) ? "解決済み" : "未解決"}</Badge>
                              </Group>
                              <Text size="sm" c="dimmed">あなたが最後のAdministratorです。</Text>
                              <Radio.Group label="このCommunityの対応" value={decision?.choice ?? ""} onChange={(value) => changeDecision(community.id, { choice: value as Decision["choice"], successor: value === "keep" ? decision?.successor ?? null : null })}>
                                <Stack gap="md" mt="sm">
                                  {community.candidates.length > 0 ? (
                                    <Box p="sm" style={{ border: "1px solid var(--mantine-color-default-border)", borderRadius: "var(--mantine-radius-md)" }}>
                                      <Radio value="keep" label="Communityを保持する" description="別のMemberをAdministratorに指定します。" />
                                      {decision?.choice === "keep" && <Select mt="md" label="後任のAdministrator" placeholder="Memberを選択" data={community.candidates} value={decision.successor} onChange={(value) => changeDecision(community.id, { choice: "keep", successor: value })} clearable />}
                                    </Box>
                                  ) : <PrototypeFormAlert kind="info" title="後任にできるMemberがいません">このCommunityは保持できません。削除を選択してください。</PrototypeFormAlert>}
                                  <Box p="sm" style={{ border: "1px solid var(--mantine-color-default-border)", borderRadius: "var(--mantine-radius-md)" }}>
                                    <Radio value="delete" label="Communityを削除する" description="削除による影響は次のステップで確認します。" />
                                  </Box>
                                </Stack>
                              </Radio.Group>
                            </Stack>
                          </Box>
                        )
                      })}
                      <Group gap="sm" justify="space-between">
                        <Group gap="sm">
                          <Button size="sm" variant="subtle" color="gray" onClick={() => setCancelled(true)}>キャンセル</Button>
                          <Button size="sm" variant="default" onClick={back}>戻る</Button>
                        </Group>
                        <Button size="sm" disabled={!allResolved} onClick={next}>次へ</Button>
                      </Group>
                    </Stack>
                  </Box>
                )}
                {step === 2 && (
                  <Box maw={600}>
                    <Title order={2} size="h4">削除対象の確認</Title>
                    <Divider my="md" />
                    <Stack gap="lg">
                      <Text size="sm" c="dimmed">削除するCommunityの影響を確認し、各Community名を入力してください。</Text>
                      <Badge color={allConfirmed ? "green" : "yellow"} variant="light" w="fit-content">{allConfirmed ? "すべて確認済み" : `未確認 ${toDelete.filter((item) => confirmations[item.id] !== item.name).length}件`}</Badge>
                      {toDelete.map((community) => (
                        <Box key={community.id} p="md" style={{ border: "1px solid var(--mantine-color-default-border)", borderRadius: "var(--mantine-radius-md)" }}>
                          <Stack gap="md">
                            <Title order={3} size="h5">{community.name}</Title>
                            <Text size="sm">参加者：{community.members}人 / Community管理Media：{community.media}件</Text>
                            <PrototypeFormAlert kind="error" title="削除したCommunityは復元できません">他のUserがアップロードしたMediaも含め、このCommunityと管理Mediaが削除されます。</PrototypeFormAlert>
                            <TextInput
                              label="確認のためCommunity名を入力"
                              description={`「${community.name}」と入力してください。`}
                              value={confirmations[community.id] ?? ""}
                              onChange={(event) => setConfirmations((previous) => ({ ...previous, [community.id]: event.currentTarget.value }))}
                              error={confirmations[community.id] && confirmations[community.id] !== community.name ? "Community名が一致しません" : undefined}
                            />
                          </Stack>
                        </Box>
                      ))}
                      <Group gap="sm" justify="space-between">
                        <Group gap="sm">
                          <Button size="sm" variant="subtle" color="gray" onClick={() => setCancelled(true)}>キャンセル</Button>
                          <Button size="sm" variant="default" onClick={back}>戻る</Button>
                        </Group>
                        <Button size="sm" disabled={!allConfirmed} onClick={next}>次へ</Button>
                      </Group>
                    </Stack>
                  </Box>
                )}
                {step === 3 && (
                  <Box maw={600}>
                    <Title order={2} size="h4">最終確認</Title>
                    <Divider my="md" />
                    <Stack gap="lg">
                      {!needsResolution && <PrototypeFormAlert kind="info" title="Communityへの対応は不要です">管理状態の解消と削除対象の確認は、対象がないため省略しました。</PrototypeFormAlert>}
                      {needsResolution && toDelete.length === 0 && <PrototypeFormAlert kind="info" title="削除するCommunityはありません">削除対象の確認は、対象がないため省略しました。</PrototypeFormAlert>}
                      <Box>
                        <Title order={3} size="h5">アカウントとMedia</Title>
                        <Text size="sm">アカウントおよび管理Media {mediaCount}件を削除します。</Text>
                      </Box>
                      {needsResolution && (
                        <Box>
                          <Title order={3} size="h5">Communityへの対応</Title>
                          <Stack gap="xs" mt="sm">
                            {communities.map((community) => (
                              <Text key={community.id} size="sm">
                                {community.name}：{decisions[community.id]?.choice === "delete" ? "削除" : `保持（後任：${community.candidates.find((candidate) => candidate.value === decisions[community.id]?.successor)?.label ?? "未指定"}）`}
                              </Text>
                            ))}
                          </Stack>
                        </Box>
                      )}
                      <PrototypeFormAlert kind="error" title="削除は取り消せません">内容を確認した後、再認証と最終確定が必要です。</PrototypeFormAlert>
                      {reauth && <PrototypeFormAlert kind="info" title="再認証（プロトタイプ）">実際のAuth0認証は行いません。削除処理も実行されません。</PrototypeFormAlert>}
                      <Group gap="sm" justify="space-between">
                        <Group gap="sm">
                          <Button size="sm" variant="subtle" color="gray" onClick={() => setCancelled(true)}>キャンセル</Button>
                          <Button size="sm" variant="default" onClick={() => { setReauth(false); back() }}>戻る</Button>
                        </Group>
                        <Button size="sm" color={reauth ? "red" : undefined} onClick={() => reauth ? setConfirmed(true) : next()}>{reauth ? "削除を確定（デモ）" : "再認証へ（デモ）"}</Button>
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
