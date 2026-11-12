"use client"

import { ExplicitSaveRecoveryActions } from "@/ui/ExplicitSave"
import { FeedbackPanel } from "@/components/Feedback"
import type { useCommunityNameSettings } from "./useCommunityNameSettings"
import { resolveCommunityNameSaveFeedback } from "./resolveCommunityNameSaveFeedback"

type Props = Pick<
  ReturnType<typeof useCommunityNameSettings>,
  | "formInvalid"
  | "failure"
  | "blockedFeedback"
  | "draft"
  | "unknown"
  | "inspection"
  | "inspectName"
  | "confirmObservation"
  | "discardUnconfirmed"
  | "canResaveInspected"
  | "saveName"
>

/** Owns the confirmation/retry/discard feedback UI, not the form's recovery state. */
export function CommunityNameSaveFeedback({
  formInvalid,
  failure,
  blockedFeedback,
  draft,
  unknown = false,
  inspection,
  inspectName,
  confirmObservation,
  discardUnconfirmed,
  canResaveInspected = false,
  saveName,
}: Props) {
  const feedback = resolveCommunityNameSaveFeedback({
    formInvalid,
    failure,
    blockedFeedback,
    inspection,
    draft,
    hasInspector: Boolean(inspectName),
  })
  if (!feedback) return null

  return (
    <FeedbackPanel
      kind={feedback.kind}
      title={feedback.title}
      role="alert"
      actions={
        unknown && inspectName ? (
          <ExplicitSaveRecoveryActions
            inspectionStatus={inspection?.status ?? "idle"}
            onInspect={inspectName}
            onConfirm={confirmObservation}
            onResave={saveName}
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
