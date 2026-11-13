"use client"

import { useEffect, useRef, useState } from "react"
import { createAutoSaveQueue, type AutoSaveQueue, type ActionOutcome } from "@/ui/Action"
import { resolveFormFailureValidation } from "@/ui/formValidation"
import { SettingsInputValidationError, classifySettingsSaveFailure } from "@/infrastructure/graphql/settingsMutationResult"
import type { SaveStatusState } from "@/components/SaveStatus"
import { getPreferencesBlockedFeedback, type PreferencesBlockedFeedback } from "./preferencesBlockedFeedback"
import type { UserPreferences, UserPreferencesPatch } from "./userPreferences"

type Failure = "unknown" | "retryable" | "blocked" | "validation" | null
type Save = (patch: UserPreferencesPatch) => Promise<UserPreferences>
type Rejection = { kind: "validation"; error: SettingsInputValidationError } | { kind: "blocked"; error: unknown } | { kind: "retryable" }
type State = {
  confirmed: UserPreferences
  saveStatus: SaveStatusState
  failure: Failure
  blockedFeedback: PreferencesBlockedFeedback | null
  validation: { fieldErrors: Record<string, string>; formError: boolean } | null
  inspected: boolean
  observedMatches: boolean
  discardRevision: number
}

/** 画面のLifetimeだけに属する保存Queue・Draft/Feedback・明示Recoveryを結合する。 */
export function usePreferencesSave(
  onSave?: Save,
  initialPreferences?: UserPreferences,
  onInspect?: () => Promise<UserPreferences>,
) {
  const [state, setState] = useState<State>(() => ({
    confirmed: initialPreferences!,
    saveStatus: "idle",
    failure: null,
    blockedFeedback: null,
    validation: null,
    inspected: false,
    observedMatches: false,
    discardRevision: 0,
  }))
  const stateRef = useRef(state)
  stateRef.current = state
  const mounted = useRef(true)
  const saveRef = useRef(onSave)
  saveRef.current = onSave
  const inspectRef = useRef(onInspect)
  inspectRef.current = onInspect
  const pending = useRef<UserPreferencesPatch>({})
  const queueRef = useRef<AutoSaveQueue<UserPreferencesPatch> | null>(null)
  const confirmedLocally = useRef(new Set<keyof UserPreferences>())
  const observed = useRef<UserPreferences | null>(null)
  const inspectionGeneration = useRef(0)
  const accentDraft = useRef<string | null>(null)

  const emit = (patch: Partial<State>) => {
    if (!mounted.current) return
    const next = { ...stateRef.current, ...patch }
    stateRef.current = next
    setState(next)
  }

  const makeQueue = (delayMs = 400): AutoSaveQueue<UserPreferencesPatch> =>
    createAutoSaveQueue<UserPreferencesPatch, UserPreferences, Rejection>({
      delayMs,
      execute: async (patch): Promise<ActionOutcome<UserPreferences, Rejection>> => {
        emit({ saveStatus: "saving" })
        try {
          if (!saveRef.current) return { kind: "unknown" }
          return { kind: "success", value: await saveRef.current(patch) }
        } catch (error) {
          if (error instanceof SettingsInputValidationError)
            return { kind: "rejected", reason: { kind: "validation", error } }
          const failure = classifySettingsSaveFailure(error)
          if (failure === "blocked") return { kind: "rejected", reason: { kind: "blocked", error } }
          if (failure === "retryable") return { kind: "rejected", reason: { kind: "retryable" } }
          return { kind: "unknown" }
        }
      },
      onResult: ({ attempted, outcome }) => {
        if (!mounted.current) return
        if (outcome.kind === "success") {
          const confirmed = { ...stateRef.current.confirmed }
          const nextPending = { ...pending.current }
          for (const key of Object.keys(attempted) as Array<keyof UserPreferences>) {
            Object.assign(confirmed, { [key]: outcome.value[key] })
            confirmedLocally.current.add(key)
            if (nextPending[key] === attempted[key]) delete nextPending[key]
          }
          pending.current = nextPending
          emit({
            confirmed,
            saveStatus: Object.keys(nextPending).length ? "saving" : "saved",
            failure: null, validation: null, blockedFeedback: null,
          })
        } else {
          const failure: Failure = outcome.kind === "unknown" ? "unknown" : outcome.reason.kind
          const error = outcome.kind === "rejected" && "error" in outcome.reason ? outcome.reason.error : null
          emit({
            failure,
            saveStatus: "attention",
            blockedFeedback: failure === "blocked" ? getPreferencesBlockedFeedback(error) : null,
            validation: error instanceof SettingsInputValidationError
              ? resolveFormFailureValidation(error.violations, Object.keys(attempted))
              : null,
            inspected: false,
            observedMatches: false,
          })
        }
      },
    })

  const enqueue = (patch: UserPreferencesPatch) => {
    if (!saveRef.current || stateRef.current.failure === "blocked") return
    pending.current = { ...pending.current, ...patch }
    observed.current = null
    inspectionGeneration.current += 1
    emit({
      inspected: false, observedMatches: false,
      validation: stateRef.current.validation
        ? { fieldErrors: Object.fromEntries(Object.entries(stateRef.current.validation.fieldErrors).filter(([key]) => !(key in patch))), formError: false }
        : null,
      saveStatus: stateRef.current.failure ? "attention" : "pending",
    })
    if (stateRef.current.failure) return
    if (!queueRef.current) queueRef.current = makeQueue()
    queueRef.current.enqueue(patch)
  }

  useEffect(() => {
    mounted.current = true
    return () => {
      mounted.current = false
      inspectionGeneration.current += 1
      // Queueはclose後も必要な通信試行を保持するが、画面Stateは更新しない。
      void queueRef.current?.close()
      queueRef.current = null
      pending.current = {}
      observed.current = null
    }
  }, [])

  useEffect(() => {
    if (!initialPreferences || stateRef.current.failure) return
    const confirmed = { ...stateRef.current.confirmed }
    let changed = false
    for (const key of Object.keys(initialPreferences) as Array<keyof UserPreferences>) {
      if (confirmedLocally.current.has(key)) {
        if (initialPreferences[key] === confirmed[key]) confirmedLocally.current.delete(key)
        else continue
      }
      if (key in pending.current) continue
      if (confirmed[key] !== initialPreferences[key]) {
        Object.assign(confirmed, { [key]: initialPreferences[key] })
        changed = true
      }
    }
    if (changed) emit({ confirmed })
  }, [initialPreferences])

  const inspect = async () => {
    if (stateRef.current.failure !== "unknown" || !inspectRef.current) return
    const generation = ++inspectionGeneration.current
    const patchAtStart = pending.current
    const rawAtStart = accentDraft.current
    observed.current = null
    emit({ inspected: false, observedMatches: false })
    try {
      const current = await inspectRef.current()
      if (!mounted.current || generation !== inspectionGeneration.current ||
        stateRef.current.failure !== "unknown" || pending.current !== patchAtStart ||
        accentDraft.current !== rawAtStart) return
      observed.current = current
      const keys = Object.keys(pending.current) as Array<keyof UserPreferences>
      emit({
        inspected: true,
        observedMatches: keys.length > 0 && keys.every(key => current[key] === pending.current[key]) &&
          (accentDraft.current === null || /^#[0-9A-Fa-f]{6}$/.test(accentDraft.current)),
      })
    } catch {
      if (mounted.current && generation === inspectionGeneration.current)
        emit({ inspected: false, observedMatches: false })
    }
  }

  const confirmObservation = () => {
    const current = observed.current
    if (!current || stateRef.current.failure !== "unknown" || !stateRef.current.observedMatches) return
    const confirmed = { ...stateRef.current.confirmed }
    for (const key of Object.keys(pending.current) as Array<keyof UserPreferences>) {
      Object.assign(confirmed, { [key]: current[key] })
      confirmedLocally.current.add(key)
    }
    pending.current = {}
    observed.current = null
    void queueRef.current?.close()
    queueRef.current = null
    emit({ confirmed, failure: null, saveStatus: "idle", validation: null, blockedFeedback: null, inspected: false, observedMatches: false })
  }

  const retry = () => {
    const { failure, inspected } = stateRef.current
    if (!failure || failure === "blocked" || (failure === "unknown" && !inspected)) return
    if (accentDraft.current !== null && !/^#[0-9A-Fa-f]{6}$/.test(accentDraft.current)) return
    const patch = pending.current
    if (!Object.keys(patch).length) return
    observed.current = null
    // 停止した旧Queueは再開せず、新しい明示Attemptとして再構築する。
    void queueRef.current?.close()
    queueRef.current = makeQueue(0)
    emit({ failure: null, saveStatus: "pending", validation: null, blockedFeedback: null, inspected: false, observedMatches: false })
    queueRef.current.enqueue(patch)
    // 明示Retryは新しいAttemptとして最短の次Tickに送信し、後続編集も受け付ける。
  }

  const discard = () => {
    if (stateRef.current.saveStatus === "saving") return
    pending.current = {}
    observed.current = null
    inspectionGeneration.current += 1
    void queueRef.current?.close()
    queueRef.current = null
    emit({
      failure: null, saveStatus: "idle", blockedFeedback: null, validation: null,
      inspected: false, observedMatches: false,
      discardRevision: stateRef.current.discardRevision + 1,
    })
  }

  return {
    saveError: state.failure,
    blockedFeedback: state.blockedFeedback,
    validation: state.validation,
    saveStatus: state.saveStatus,
    confirmed: state.confirmed,
    discardRevision: state.discardRevision,
    enqueue,
    setAccentDraft: (value: string) => {
      accentDraft.current = value
      inspectionGeneration.current += 1
      observed.current = null
      emit({ inspected: false, observedMatches: false })
    },
    retry, inspect, confirmObservation, discard,
    inspected: state.inspected,
    observedMatches: state.observedMatches,
  }
}
