"use client"

import { Button } from "@mantine/core"
import type { ExplicitSaveInspection } from "./useExplicitSave"

type InspectionStatus = ExplicitSaveInspection<unknown>["status"]

/**
 * Shared presentation of explicit-save Unknown recovery actions.
 * The owning Form decides availability and supplies its own handlers.
 * The Feedback panel, explanatory text and Form state stay with each Feature.
 */
export function ExplicitSaveRecoveryActions({
  inspectionStatus,
  onInspect,
  onConfirm,
  onResave,
  onDiscard,
  canResave,
}: {
  inspectionStatus: InspectionStatus
  onInspect?: () => void | Promise<void>
  onConfirm?: () => void
  onResave: () => void | Promise<void>
  onDiscard?: () => void
  canResave: boolean
}) {
  if (!onInspect) return null

  const hasObservation =
    inspectionStatus === "matches" || inspectionStatus === "differs"

  return (
    <>
      <Button
        size="xs"
        variant="light"
        loading={inspectionStatus === "checking"}
        onClick={() => void onInspect()}
      >
        {hasObservation ? "もう一度確認" : "現在の状態を確認"}
      </Button>
      {inspectionStatus === "matches" && onConfirm && (
        <Button size="xs" onClick={onConfirm}>
          確認完了
        </Button>
      )}
      {inspectionStatus === "differs" && (
        <>
          <Button
            size="xs"
            disabled={!canResave}
            onClick={() => void onResave()}
          >
            もう一度保存
          </Button>
          {onDiscard && (
            <Button
              size="xs"
              variant="subtle"
              color="gray"
              onClick={onDiscard}
            >
              変更を破棄
            </Button>
          )}
        </>
      )}
    </>
  )
}
