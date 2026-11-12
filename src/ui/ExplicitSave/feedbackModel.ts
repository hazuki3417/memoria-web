import type { ExplicitSaveStatus } from "./useExplicitSave"

/** Presentation-ready result of a Feature's explicit-save feedback decision. */
export type ExplicitSaveFeedbackModel = {
  kind: "error" | "warning"
  title: string
  description: string
}

export type ExplicitSaveFailureStatus = Exclude<
  ExplicitSaveStatus,
  "idle" | "saving"
>
