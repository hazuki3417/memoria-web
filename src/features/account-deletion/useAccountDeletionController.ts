"use client"

import { useMediaQuery } from "@mantine/hooks"
import { useRef, useState } from "react"
import {
  mockAccountDeletionGateway,
  unavailableAccountDeletionGateway,
  type DeletionReview,
  type DeletionGrant,
  type MockScenario,
} from "./accountDeletionGateway"
import {
  communitiesForScenario,
  type CommunityScenario,
  type ReviewState,
  type RetryOutcome,
  type Decision,
} from "./accountDeletionScenarios"

export function useAccountDeletionController({
  reviewState,
  communityScenario,
  retryOutcome,
  mockScenario,
  prototype,
  onNavigateBack,
}: {
  reviewState: ReviewState
  communityScenario: CommunityScenario
  retryOutcome: RetryOutcome
  mockScenario?: MockScenario
  prototype: boolean
  onNavigateBack: () => void
}) {
  const [step, setStep] = useState(0)
  const compactStepper = useMediaQuery("(max-width: 48em)")
  const [loadState, setLoadState] = useState<"ready" | "failed" | "retrying">(
    reviewState === "failure"
      ? "failed"
      : reviewState === "retrying"
        ? "retrying"
        : "ready",
  )
  const [decisions, setDecisions] = useState<Record<string, Decision>>({})
  const [confirmations, setConfirmations] = useState<Record<string, string>>({})
  const [cancelled, setCancelled] = useState(false)
  const [cancelConfirmationOpened, setCancelConfirmationOpened] =
    useState(false)
  const gateway = useRef(
    mockScenario
      ? mockAccountDeletionGateway(mockScenario)
      : unavailableAccountDeletionGateway,
  )
  const [reauth, setReauth] = useState(false)
  const [review, setReview] = useState<DeletionReview | null>(null)
  const [grant, setGrant] = useState<DeletionGrant | null>(null)
  const [busy, setBusy] = useState(false)
  const [flowError, setFlowError] = useState<string | null>(null)
  const [confirmed, setConfirmed] = useState(false)
  const [deletionPending, setDeletionPending] = useState(false)
  const mediaCount = reviewState === "empty" ? 0 : 24
  const communities = communitiesForScenario(communityScenario)
  const communitiesToResolve = communities.filter(
    (community) => community.relation === "last-administrator",
  )
  const _communitiesToWithdraw = communities.filter(
    (community) => community.relation !== "last-administrator",
  )
  const hasCommunities = communities.length > 0
  const needsResolution = communitiesToResolve.length > 0
  const resolved = (id: string) => {
    const decision = decisions[id]
    const community = communities.find((item) => item.id === id)
    return (
      decision?.choice === "delete" ||
      (decision?.choice === "keep" &&
        decision.successors.length > 0 &&
        decision.successors.every((successor) =>
          community?.candidates.some(
            (candidate) => candidate.value === successor,
          ),
        ))
    )
  }
  const allResolved = communitiesToResolve.every((item) => resolved(item.id))
  const toDelete = communitiesToResolve.filter(
    (item) => decisions[item.id]?.choice === "delete",
  )
  const allConfirmed = toDelete.every(
    (item) => confirmations[item.id] === item.name,
  )
  const hasPendingChanges =
    Object.keys(decisions).length > 0 ||
    Object.values(confirmations).some((value) => value.length > 0)
  const reviewFingerprint = JSON.stringify({
    decisions,
    confirmations,
    communityScenario,
    mediaCount: reviewState === "empty" ? 0 : 24,
  })
  const startReauthentication = async () => {
    if (busy) return
    setBusy(true)
    setFlowError(null)
    setReauth(false)
    setGrant(null)
    setReview(null)
    try {
      const nextReview = await gateway.current.createReview(reviewFingerprint)
      const result = await gateway.current.reauthenticate(nextReview)
      if (result.status !== "success") {
        setFlowError(
          result.status === "cancelled"
            ? "再認証がキャンセルされました。"
            : "再認証に失敗しました。",
        )
        return
      }
      setReview(nextReview)
      setGrant(result.grant)
      setReauth(true)
    } catch (error) {
      setFlowError(
        error instanceof Error
          ? error.message
          : "再認証を開始できませんでした。",
      )
    } finally {
      setBusy(false)
    }
  }
  const confirmDeletion = async () => {
    if (busy || !review || !grant) return
    if (review.fingerprint !== reviewFingerprint) {
      setGrant(null)
      setReauth(false)
      setFlowError("削除計画が変更されました。再認証してください。")
      return
    }
    setBusy(true)
    setDeletionPending(true)
    setFlowError(null)
    try {
      await gateway.current.confirm(review, grant)
      setConfirmed(true)
    } catch (error) {
      setFlowError(
        error instanceof Error ? error.message : "削除処理に失敗しました。",
      )
      setGrant(null)
      setReauth(false)
    } finally {
      setBusy(false)
      setDeletionPending(false)
    }
  }
  const cancel = () => {
    if (hasPendingChanges) {
      setCancelConfirmationOpened(true)
      return
    }
    if (prototype) setCancelled(true)
    else onNavigateBack()
  }
  const skipped = (index: number) =>
    (index === 1 && !hasCommunities) || (index === 2 && !hasCommunities)
  const next = () => {
    if (step === 0) setStep(hasCommunities ? 1 : 3)
    if (step === 1 && allResolved) setStep(2)
    if (step === 2 && allConfirmed) setStep(3)
    if (step === 3) {
      if (prototype) setReauth(true)
      else void startReauthentication()
    }
  }
  const back = () => {
    if (step === 3) {
      setReauth(false)
      setGrant(null)
      setReview(null)
      setStep(hasCommunities ? 2 : 0)
    }
    if (step === 2) setStep(1)
    if (step === 1) setStep(0)
  }
  const changeDecision = (id: string, decision: Decision) => {
    setGrant(null)
    setReview(null)
    setReauth(false)
    setDecisions((previous) => ({ ...previous, [id]: decision }))
    setConfirmations((previous) => ({ ...previous, [id]: "" }))
  }

  return { step, setStep, compactStepper, loadState, setLoadState, decisions, confirmations, setConfirmations, cancelled, setCancelled, cancelConfirmationOpened, setCancelConfirmationOpened, reauth, setReauth, setGrant, setReview, busy, flowError, confirmed, setConfirmed, deletionPending, mediaCount, communities, communitiesToResolve, hasCommunities, needsResolution, allResolved, toDelete, allConfirmed, cancel, skipped, next, back, changeDecision, startReauthentication, confirmDeletion }
}
