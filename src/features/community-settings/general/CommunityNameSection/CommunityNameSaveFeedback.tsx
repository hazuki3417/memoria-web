"use client"

import { ExplicitSaveRecoveryActions } from "@/ui/ExplicitSave"
import { FeedbackPanel } from "@/components/Feedback"
import type { useCommunityNameForm } from "./useCommunityNameForm"
import { resolveCommunityNameSaveFeedback } from "./resolveCommunityNameSaveFeedback"

type Props = Pick<
  ReturnType<typeof useCommunityNameForm>,
  | "formInvalid"
  | "failure"
  | "blockedFeedback"
  | "draft"
  | "inspection"
  | "inspect"
  | "confirmObservation"
  | "discardUnconfirmed"
  | "canResaveInspected"
  | "save"
>

/** Owns the confirmation/retry/discard feedback UI, not the form's recovery state. */
export function CommunityNameSaveFeedback({
  formInvalid,
  failure,
  blockedFeedback,
  draft,
  inspection,
  inspect,
  confirmObservation,
  discardUnconfirmed,
  canResaveInspected = false,
  save,
}: Props) {
  const feedback = resolveCommunityNameSaveFeedback({
    formInvalid,
    failure,
    blockedFeedback,
    inspection,
    draft,
    hasInspector: Boolean(inspect),
  })
  if (!feedback) return null

  return (
    <FeedbackPanel
      kind={feedback.kind}
      title={feedback.title}
      role="alert"
      actions={
        failure === "unknown" && inspect ? (
          <ExplicitSaveRecoveryActions
            inspectionStatus={inspection.status}
            onInspect={inspect}
            onConfirm={confirmObservation}
            onResave={save}
            onDiscard={discardUnconfirmed}
            canResave={canResaveInspected}
          />
        ) : undefined
      }
    >
      {feedback.description}
    </FeedbackPanel>
  )
}
