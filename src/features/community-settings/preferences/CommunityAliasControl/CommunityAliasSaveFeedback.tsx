"use client"

import { ExplicitSaveRecoveryActions } from "@/ui/ExplicitSave"
import { FeedbackPanel } from "@/components/Feedback"
import type { useCommunityAliasForm } from "./useCommunityAliasForm"
import { resolveCommunityAliasSaveFeedback } from "./resolveCommunityAliasSaveFeedback"

type AliasForm = ReturnType<typeof useCommunityAliasForm>

/** Presents the Feature-owned Alias feedback and shared Unknown recovery actions. */
export function CommunityAliasSaveFeedback({
  model,
  onInspect,
}: {
  model: AliasForm
  onInspect?: () => Promise<string | null>
}) {
  const {
    failure, formInvalid, blockedFeedback, inspection,
    inspect, canResaveInspected, confirmObservation, discardUnconfirmed,
    normalized, save,
  } = model
  const feedback = resolveCommunityAliasSaveFeedback({
    failure,
    formInvalid,
    blockedFeedback,
    inspection,
    normalized,
    hasInspector: Boolean(onInspect),
  })

  if (!feedback) return null

  return (
    <FeedbackPanel
      kind={feedback.kind}
      role="alert"
      title={feedback.title}
      actions={
        failure === "unknown" && onInspect ? (
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
