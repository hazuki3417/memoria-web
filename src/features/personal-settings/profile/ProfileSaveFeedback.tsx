"use client"

import { FeedbackPanel } from "@/components/Feedback"
import { getProfileSaveFeedback } from "./profileSaveFeedback"
import type { useProfileForm } from "./useProfileForm"

type ProfileForm = ReturnType<typeof useProfileForm>

/** Profileの保存結果・入力エラーを一件のFeedbackとして表示する。 */
export const ProfileSaveFeedback = ({
  model,
  blockedMessage,
}: {
  model: ProfileForm
  blockedMessage: string
}) => {
  const feedback = getProfileSaveFeedback({
    status: model.status,
    formInvalid: model.formInvalid,
    blockedMessage,
  })
  if (!feedback) return null

  return (
    <FeedbackPanel kind={feedback.kind} title={feedback.title} role="alert">
      {feedback.description}
    </FeedbackPanel>
  )
}
