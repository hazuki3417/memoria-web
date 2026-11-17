"use client"

import { FeedbackPanel } from "@/components/Feedback"
import { resolveCommunityNameSaveFeedback } from "./resolveCommunityNameSaveFeedback"
import type { useCommunityNameForm } from "./useCommunityNameForm"

type NameForm = ReturnType<typeof useCommunityNameForm>

/** Community名の保存状態を一件のFeedbackとして表示する。 */
export const CommunityNameSaveFeedback = ({ model }: { model: NameForm }) => {
  const feedback = resolveCommunityNameSaveFeedback({
    status: model.status,
    formInvalid: model.formInvalid,
  })
  if (!feedback) return null
  return (
    <FeedbackPanel kind={feedback.kind} title={feedback.title} role="alert">
      {feedback.description}
    </FeedbackPanel>
  )
}
