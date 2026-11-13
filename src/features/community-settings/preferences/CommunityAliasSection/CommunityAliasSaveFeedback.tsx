"use client"

import { Button } from "@mantine/core"
import { FeedbackPanel } from "@/components/Feedback"
import { resolveCommunityAliasSaveFeedback } from "./resolveCommunityAliasSaveFeedback"
import type { useCommunityAliasForm, InspectCommunityAlias } from "./useCommunityAliasForm"

type AliasForm = ReturnType<typeof useCommunityAliasForm>

/** Community別名の保存失敗・結果不明の案内を1件表示し、明示復旧操作を提供する。 */
export const CommunityAliasSaveFeedback = ({
  model,
  onInspect,
}: {
  model: AliasForm
  onInspect?: InspectCommunityAlias
}) => {
  const {
    failure, formInvalid, blockedFeedback, inspection,
    inspect, canResaveInspected, confirmObservation, discardUnconfirmed,
    normalized, save,
  } = model
  const feedback = resolveCommunityAliasSaveFeedback({
    failure, formInvalid, blockedFeedback, inspection,
    normalized, hasInspection: Boolean(onInspect),
  })
  if (!feedback) return null

  const actions = feedback.type === "unknown" && onInspect ? (
    <>
      <Button
        size="xs"
        variant="light"
        loading={inspection.status === "checking"}
        onClick={() => void inspect()}
      >
        {inspection.status === "matches" || inspection.status === "differs"
          ? "もう一度確認"
          : "現在の状態を確認"}
      </Button>
      {inspection.status === "matches" && (
        <Button size="xs" onClick={confirmObservation}>確認完了</Button>
      )}
      {inspection.status === "differs" && (
        <>
          <Button
            size="xs"
            disabled={!canResaveInspected}
            onClick={() => void save()}
          >
            もう一度保存
          </Button>
          <Button
            size="xs"
            variant="subtle"
            color="gray"
            onClick={discardUnconfirmed}
          >
            変更を破棄
          </Button>
        </>
      )}
    </>
  ) : undefined

  return (
    <FeedbackPanel
      kind={feedback.kind}
      role="alert"
      title={feedback.title}
      actions={actions}
    >
      {feedback.description}
    </FeedbackPanel>
  )
}
