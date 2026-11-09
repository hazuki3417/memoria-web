"use client"

import { Button } from "@mantine/core"
import { FeedbackPanel } from "@/components/Feedback"
import type { CommunityNameSectionProps } from "./CommunityNameSection"

type Props = Pick<
  CommunityNameSectionProps,
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
          <>
            <Button
              size="xs"
              variant="light"
              loading={inspection?.status === "checking"}
              onClick={() => void inspectName()}
            >
              {inspection?.status === "matches" || inspection?.status === "differs"
                ? "もう一度確認"
                : "現在の状態を確認"}
            </Button>
            {inspection?.status === "matches" && confirmObservation && (
              <Button size="xs" onClick={confirmObservation}>
                確認完了
              </Button>
            )}
            {inspection?.status === "differs" && (
              <>
                <Button
                  size="xs"
                  disabled={!canResaveInspected}
                  onClick={saveName}
                >
                  もう一度保存
                </Button>
                {discardUnconfirmed && (
                  <Button
                    size="xs"
                    variant="subtle"
                    color="gray"
                    onClick={discardUnconfirmed}
                  >
                    変更を破棄
                  </Button>
                )}
              </>
            )}
          </>
        ) : undefined
      }
    >
      {saveFeedback.description}
    </FeedbackPanel>
  )
}
