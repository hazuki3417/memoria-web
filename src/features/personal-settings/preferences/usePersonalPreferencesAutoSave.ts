"use client"

import { useEffect, useRef, useState } from "react"
import { createAutoSaveQueue, type AutoSaveQueue, type ActionOutcome } from "@/ui/Action"
import { resolveFormFailureValidation } from "@/ui/formValidation"
import { SettingsInputValidationError, classifySettingsSaveFailure } from "@/infrastructure/graphql/settingsMutationResult"
import type { SaveStatusState } from "@/components/SaveStatus"
import { getPersonalPreferencesBlockedFeedback, type PersonalPreferencesBlockedFeedback } from "./personalPreferencesBlockedFeedback"
import type { PersonalPreferencesValues, PersonalPreferencesPatch } from "./personalPreferences"
import type { PersonalPreferencesSaveRejection, SavePersonalPreferencesAction } from "./personalPreferencesSaveOutcome"

type Failure = "unknown" | "retryable" | "blocked" | "validation" | null
type Save = (patch: PersonalPreferencesPatch) => Promise<PersonalPreferencesValues>
type Rejection = PersonalPreferencesSaveRejection
type State = {
  confirmed: PersonalPreferencesValues
  draftPatch: PersonalPreferencesPatch
  saveStatus: SaveStatusState
  failure: Failure
  blockedFeedback: PersonalPreferencesBlockedFeedback | null
  validation: { fieldErrors: Record<string, string>; formError: boolean } | null
  inspected: boolean
  observedMatches: boolean
  discardRevision: number
}

/** 画面のLifetimeだけに属する保存Queue・Draft/Feedback・明示Recoveryを結合する。 */
export const usePersonalPreferencesAutoSave = (
  onSave?: Save,
  initialPreferences?: PersonalPreferencesValues,
  onInspect?: () => Promise<PersonalPreferencesValues>,
  onSaveAction?: SavePersonalPreferencesAction,
  onConfirm?: (patch: PersonalPreferencesPatch) => void,
) => {
  const [state, setState] = useState<State>(() => ({
    confirmed: initialPreferences!,
    draftPatch: {},
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
  const lifetimeGeneration = useRef(0)
  const saveRef = useRef(onSave)
  saveRef.current = onSave
  const actionRef = useRef(onSaveAction)
  actionRef.current = onSaveAction
  const inspectRef = useRef(onInspect)
  inspectRef.current = onInspect
  const pending = useRef<PersonalPreferencesPatch>({})
  const queueRef = useRef<AutoSaveQueue<PersonalPreferencesPatch> | null>(null)
  const activeAttempt = useRef<PersonalPreferencesPatch | null>(null)
  const previousSource = useRef(initialPreferences)
  const observed = useRef<PersonalPreferencesValues | null>(null)
  const inspectionGeneration = useRef(0)
  const accentDraft = useRef<string | null>(null)

  const emit = (patch: Partial<State>) => {
    if (!mounted.current) return
    const next = { ...stateRef.current, ...patch }
    stateRef.current = next
    setState(next)
  }

  const makeQueue = (delayMs = 400): AutoSaveQueue<PersonalPreferencesPatch> => {
    const generation = lifetimeGeneration.current
    const action = actionRef.current
    const save = saveRef.current
    const active = () => mounted.current && lifetimeGeneration.current === generation
    return createAutoSaveQueue<PersonalPreferencesPatch, PersonalPreferencesValues, Rejection>({
      delayMs,
      shouldExecute: (patch) => Object.values(patch).some(value => value !== undefined),
      execute: async (queued): Promise<ActionOutcome<PersonalPreferencesValues, Rejection>> => {
        const patch = Object.fromEntries(Object.entries(queued).filter(([, value]) => value !== undefined)) as PersonalPreferencesPatch
        if (active()) {
          activeAttempt.current = patch
          emit({ saveStatus: "saving" })
        }
        try {
          if (action) return await action(patch)
          if (!save) return { kind: "unknown" }
          return { kind: "success", value: await save(patch) }
        } catch (error) {
          if (error instanceof SettingsInputValidationError)
            return { kind: "rejected", reason: { kind: "validation", violations: error.violations } }
          const failure = classifySettingsSaveFailure(error)
          if (failure === "blocked") return { kind: "rejected", reason: { kind: "blocked", error } }
          if (failure === "retryable") return { kind: "rejected", reason: { kind: "retryable" } }
          return { kind: "unknown" }
        }
      },
      onResult: ({ attempted, outcome, unsent }) => {
        if (!active()) return
        activeAttempt.current = null
        // Queueの未送信Patchと送信済みAttemptを分ける。取消用undefinedは保存対象にしない。
        const nextPending = Object.fromEntries(
          Object.entries(unsent ?? {}).filter(([, value]) => value !== undefined),
        ) as PersonalPreferencesPatch
        if (outcome.kind === "success") {
          const confirmed = { ...stateRef.current.confirmed }
          for (const key of Object.keys(attempted) as Array<keyof PersonalPreferencesValues>) {
            if (attempted[key] === undefined) continue
            Object.assign(confirmed, { [key]: outcome.value[key] })
          }
          pending.current = nextPending
          emit({
            confirmed,
            draftPatch: nextPending,
            saveStatus: Object.keys(nextPending).length ? "pending" : "saved",
            failure: null, validation: null, blockedFeedback: null,
          })
        } else {
          // 失敗Attemptは後続の有効な変更でのみ上書きする。
          const failed = Object.fromEntries(
            Object.entries(attempted).filter(([, value]) => value !== undefined),
          ) as PersonalPreferencesPatch
          pending.current = { ...failed, ...nextPending }
          const failure: Failure = outcome.kind === "unknown" ? "unknown" : outcome.reason.kind
          const error = outcome.kind === "rejected" && outcome.reason.kind === "blocked" ? outcome.reason.error : null
          const violations = outcome.kind === "rejected" && outcome.reason.kind === "validation"
            ? outcome.reason.violations : null
          emit({
            failure,
            draftPatch: pending.current,
            saveStatus: "attention",
            blockedFeedback: failure === "blocked" ? getPersonalPreferencesBlockedFeedback(error) : null,
            validation: violations
              ? resolveFormFailureValidation(violations, Object.keys(attempted))
              : null,
            inspected: false,
            observedMatches: false,
          })
        }
      },
    })
  }

  const enqueue = (patch: PersonalPreferencesPatch) => {
    if ((!saveRef.current && !actionRef.current) || stateRef.current.failure === "blocked") return
    pending.current = { ...pending.current, ...patch }
    observed.current = null
    inspectionGeneration.current += 1
    emit({
      draftPatch: pending.current,
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
      lifetimeGeneration.current += 1
      inspectionGeneration.current += 1
      // Queueはclose後も必要な通信試行を保持するが、画面Stateは更新しない。
      void queueRef.current?.close()
      queueRef.current = null
      pending.current = {}
      activeAttempt.current = null
      observed.current = null
    }
  }, [])

  useEffect(() => {
    if (!initialPreferences) return
    const previous = previousSource.current
    previousSource.current = initialPreferences
    if (stateRef.current.failure) return
    const confirmed = { ...stateRef.current.confirmed }
    let changed = false
    for (const key of Object.keys(initialPreferences) as Array<keyof PersonalPreferencesValues>) {
      // 同じQuery snapshotの再Renderは再取得ではない。
      // 通常取得の順序調停はApollo側が所有し、変化した取得値を無期限に拒否しない。
      if (previous?.[key] === initialPreferences[key] || key in pending.current) continue
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
      const keys = Object.keys(pending.current) as Array<keyof PersonalPreferencesValues>
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
    const adopted: PersonalPreferencesPatch = {}
    for (const key of Object.keys(pending.current) as Array<keyof PersonalPreferencesValues>) {
      Object.assign(confirmed, { [key]: current[key] })
      Object.assign(adopted, { [key]: current[key] })
    }
    onConfirm?.(adopted)
    pending.current = {}
    observed.current = null
    void queueRef.current?.close()
    queueRef.current = null
    emit({ confirmed, draftPatch: {}, failure: null, saveStatus: "idle", validation: null, blockedFeedback: null, inspected: false, observedMatches: false })
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
    if (activeAttempt.current || !stateRef.current.failure) return
    accentDraft.current = null
    pending.current = {}
    observed.current = null
    inspectionGeneration.current += 1
    void queueRef.current?.close()
    queueRef.current = null
    emit({
      failure: null, saveStatus: "idle", draftPatch: {}, blockedFeedback: null, validation: null,
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
    draftPatch: state.draftPatch,
    discardRevision: state.discardRevision,
    enqueue,
    setAccentDraft: (value: string) => {
      accentDraft.current = value
      inspectionGeneration.current += 1
      observed.current = null
      const inFlightColor = activeAttempt.current?.personalAccentColor
      if (!/^#[0-9A-Fa-f]{6}$/.test(value) && !stateRef.current.failure &&
          pending.current.personalAccentColor !== undefined) {
        const next = { ...pending.current }
        delete next.personalAccentColor
        if (inFlightColor !== undefined) next.personalAccentColor = inFlightColor
        pending.current = next
        // 送信済みAttemptを残し、未送信Accentだけを無効化する。
        queueRef.current?.enqueue({ personalAccentColor: undefined })
        let saveStatus: SaveStatusState = "idle"
        if (activeAttempt.current) saveStatus = "saving"
        else if (Object.keys(next).length > 0) saveStatus = "pending"
        emit({ draftPatch: next, saveStatus })
      }
      emit({ inspected: false, observedMatches: false })
      return inFlightColor
    },
    retry, inspect, confirmObservation, discard,
    inspected: state.inspected,
    observedMatches: state.observedMatches,
  }
}
