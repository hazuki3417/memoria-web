"use client"

import { Stack } from "@mantine/core"
import { ExplicitSaveRecoveryActions } from "@/ui/ExplicitSave"
import { FeedbackPanel } from "@/components/Feedback"
import type { useProfileForm } from "./useProfileForm"
import { resolveProfileSaveFeedback } from "./resolveProfileSaveFeedback"

type FormModel = ReturnType<typeof useProfileForm>

/** Renders Profile-specific Feedback while delegating recovery controls. */
export function ProfileSaveFeedback({
  model,
  onInspect,
  blockedMessage,
}: {
  model: FormModel
  onInspect?: () => Promise<string>
  blockedMessage: string
}) {
  const {
    saveState,
    formInvalid,
    isUnknown,
    isBlocked,
    blockedFeedback,
    inspection,
    normalized,
    inspectCurrentProfile,
    confirmObservedProfile,
    canRetryInspected,
    save,
    discardUnconfirmedDraft,
  } = model
  const feedback = resolveProfileSaveFeedback({
    saveState,
    formInvalid,
    isUnknown,
    isBlocked,
    blockedFeedback,
    inspection,
    normalized,
    hasInspector: Boolean(onInspect),
    blockedMessage,
  })

  return (
    <>
      {feedback.map((section) => (
        <FeedbackPanel
          key={section.id}
          kind={section.kind}
          title={section.title}
          role="alert"
          actions={
            section.id === "unknown" && onInspect ? (
              <ExplicitSaveRecoveryActions
                inspectionStatus={inspection.status}
                onInspect={inspectCurrentProfile}
                onConfirm={confirmObservedProfile}
                onResave={save}
                onDiscard={discardUnconfirmedDraft}
                canResave={canRetryInspected}
              />
            ) : undefined
          }
        >
          {section.id === "unknown" ? (
            <Stack gap="xs">
              <span>{section.description}</span>
              {section.details?.map((message) => (
                <span key={message}>{message}</span>
              ))}
            </Stack>
          ) : (
            section.description
          )}
        </FeedbackPanel>
      ))}
    </>
  )
}
