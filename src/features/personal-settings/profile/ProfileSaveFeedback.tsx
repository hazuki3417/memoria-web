"use client"

import { Button } from "@mantine/core"
import { FeedbackPanel } from "@/components/Feedback"
import { getProfileSaveFeedback } from "./profileSaveFeedback"
import type { useProfileForm, InspectProfile } from "./useProfileForm"

type ProfileForm = ReturnType<typeof useProfileForm>

/** Profile保存の案内を1件表示し、結果不明時の照会・確認・再保存・破棄を提供する。 */
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

  const feedback = getProfileSaveFeedback({
    status,
    inspection,
    formInvalid,
    normalized,
    canInspect: Boolean(onInspect),
    blockedMessage,
  })

  if (!feedback) return null

  const actions = feedback.type === "unknown" && onInspect ? (
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
  ) : undefined

  return (
    <FeedbackPanel
      kind={feedback.kind}
      title={feedback.title}
      role="alert"
      actions={actions}
    >
      {feedback.description}
    </FeedbackPanel>
  )
}
