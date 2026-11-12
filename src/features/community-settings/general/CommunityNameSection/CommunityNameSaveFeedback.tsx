"use client"

import { ExplicitSaveRecoveryActions } from "@/ui/ExplicitSave"
import { FeedbackPanel } from "@/components/Feedback"
import type { useCommunityNameSettings } from "./useCommunityNameSettings"

type Props = Pick<
  ReturnType<typeof useCommunityNameSettings>,
  | "saveFeedback"
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
  saveFeedback,
  unknown = false,
  inspection,
  inspectName,
  confirmObservation,
  discardUnconfirmed,
  canResaveInspected = false,
  saveName,
}: Props) {
  if (!saveFeedback) return null

  return (
    <FeedbackPanel
      kind={saveFeedback.kind ?? "error"}
      title={saveFeedback.title}
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
      {saveFeedback.description}
    </FeedbackPanel>
  )
}
