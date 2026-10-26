"use client"

import {
  Badge,
  Box,
  Button,
  Group,
  Modal,
  Stack,
  Stepper,
  Text,
  Title,
} from "@mantine/core"
import { Fragment, type ComponentType, type PropsWithChildren } from "react"
import type { MockScenario } from "./accountDeletionGateway"
import { FeedbackAlert } from "@/components/Feedback"

import { labels, type ReviewState, type CommunityScenario, type RetryOutcome } from "./accountDeletionScenarios"
import { useAccountDeletionController } from "./useAccountDeletionController"
import { AccountDeletionImpactStep } from "./AccountDeletionImpactStep"
import { AccountDeletionResolutionStep } from "./AccountDeletionResolutionStep"
import { AccountDeletionCommunityReviewStep } from "./AccountDeletionCommunityReviewStep"
import { AccountDeletionFinalStep } from "./AccountDeletionFinalStep"
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
  const flow = useAccountDeletionController({
    reviewState,
    communityScenario,
    mockScenario,
    prototype,
    onNavigateBack,
  })
  const { setFlowError, step, setStep, compactStepper, cancelled, setCancelled, cancelConfirmationOpened, setCancelConfirmationOpened, setReauth, setGrant, setReview, confirmed, setConfirmed, deletionPending, skipped } = flow
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
                {step === 0 && <AccountDeletionImpactStep flow={flow} retryOutcome={retryOutcome} />}
                {step === 1 && <AccountDeletionResolutionStep flow={flow} />}
                {step === 2 && <AccountDeletionCommunityReviewStep flow={flow} />}
                {step === 3 && <AccountDeletionFinalStep flow={flow} prototype={prototype} />}

              </>
            )}
          </Stack>
        </Box>
      </Shell>
    </>
  )
}
