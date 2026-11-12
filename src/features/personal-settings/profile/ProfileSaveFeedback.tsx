"use client"

import { Button, Stack } from "@mantine/core"
import { FeedbackPanel } from "@/components/Feedback"
import { getProfileSaveFeedback, type ProfileFeedbackItem } from "./profileSaveFeedback"
import type { useProfileForm, InspectProfile } from "./useProfileForm"

type ProfileForm = ReturnType<typeof useProfileForm>

/** 保存状態を利用者向けの案内として表示し、結果不明時の照会・確認・再保存・破棄を提供する。 */
export const ProfileSaveFeedback = ({
  model,
  onInspect,
  blockedMessage,
}: {
  model: ProfileForm
  onInspect?: InspectProfile
  blockedMessage: string
}) => {
  const {
    status,
    inspection,
    formInvalid,
    normalized,
    canRetryInspected,
    inspectCurrentProfile,
    confirmObservedProfile,
    discardUnconfirmedDraft,
    save,
  } = model

  const feedbacks = getProfileSaveFeedback({
    status,
    inspection,
    formInvalid,
    normalized,
    canInspect: Boolean(onInspect),
    blockedMessage,
  })

  const getActions = (feedback: ProfileFeedbackItem) => {
    if (feedback.id !== "unknown" || !onInspect) return undefined

    return (
      <>
        <Button
          size="xs"
          variant="light"
          loading={inspection.kind === "checking"}
          onClick={() => void inspectCurrentProfile()}
        >
          {inspection.kind === "idle" ||
          inspection.kind === "failed" ||
          inspection.kind === "checking"
            ? "現在の状態を確認"
            : "もう一度確認"}
        </Button>
        {inspection.kind === "matches" && (
          <Button size="xs" onClick={confirmObservedProfile}>
            確認完了
          </Button>
        )}
        {inspection.kind === "differs" && (
          <>
            <Button
              size="xs"
              disabled={!canRetryInspected}
              onClick={() => void save()}
            >
              もう一度保存
            </Button>
            <Button
              size="xs"
              variant="subtle"
              color="gray"
              onClick={discardUnconfirmedDraft}
            >
              変更を破棄
            </Button>
          </>
        )}
      </>
    )
  }

  return (
    <>
      {feedbacks.map((feedback) => (
        <FeedbackPanel
          key={feedback.id}
          kind={feedback.kind}
          title={feedback.title}
          role="alert"
          actions={getActions(feedback)}
        >
          {feedback.id === "unknown" ? (
            <Stack gap="xs">
              <span>{feedback.description}</span>
              {feedback.details?.map((detail) => <span key={detail}>{detail}</span>)}
            </Stack>
          ) : feedback.description}
        </FeedbackPanel>
      ))}
    </>
  )
}
