"use client"

import { FeedbackPanel } from "@/components/Feedback"
import { resolveCommunityAliasSaveFeedback } from "./resolveCommunityAliasSaveFeedback"
import type { useCommunityAliasForm } from "./useCommunityAliasForm"

type AliasForm = ReturnType<typeof useCommunityAliasForm>

/** Community別名の保存結果を単一のFeedbackとして表示する。 */
export const CommunityAliasSaveFeedback = ({ model }: { model: AliasForm }) => {
  const feedback = resolveCommunityAliasSaveFeedback({
    failure: model.failure,
    formInvalid: model.formInvalid,
    blockedFeedback: model.blockedFeedback,
  })
  if (!feedback) return null
  return (
    <FeedbackPanel kind={feedback.kind} role="alert" title={feedback.title}>
      {feedback.description}
    </FeedbackPanel>
  )
}
