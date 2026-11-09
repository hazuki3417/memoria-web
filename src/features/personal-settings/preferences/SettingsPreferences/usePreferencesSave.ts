"use client"

import { resolveFormFailureValidation } from "@/ui/formValidation"

import { useEffect, useRef, useState } from "react"
import { createPreferencesSaveQueue } from "../preferencesSaveQueue"
import { usePersonalPreferencesSession } from "../PersonalPreferencesSessionContext"
import type { UserPreferences, UserPreferencesPatch } from "../userPreferences"
import type { SaveStatusState } from "@/components/SaveStatus"
import {
  classifySettingsSaveFailure,
  getSettingsInputViolations,
} from "@/infrastructure/graphql/settingsMutationResult"
import type { PreferencesFailure } from "../personalPreferencesSession"
import { getPreferencesBlockedFeedback, type PreferencesBlockedFeedback } from "../preferencesBlockedFeedback"

type Save = (patch: UserPreferencesPatch) => Promise<UserPreferences>
type SaveError = PreferencesFailure

/** Session controller in Application Shell, legacy local queue for isolated Storybook. */
export function usePreferencesSave(
  onSave?: Save,
  initialPreferences?: UserPreferences,
  onInspect?: () => Promise<UserPreferences>,
) {
  const { controller: session, snapshot } = usePersonalPreferencesSession()
  const [localError, setLocalError] = useState<SaveError>(null)
  const [localBlockedFeedback, setLocalBlockedFeedback] = useState<PreferencesBlockedFeedback | null>(null)
  const [localValidation, setLocalValidation] = useState<{
    fieldErrors: Record<string, string>
    formError: boolean
  } | null>(null)
  const [localStatus, setLocalStatus] = useState<SaveStatusState>("idle")
  const saveRef = useRef(onSave)
  const inspectRef = useRef(onInspect)
  saveRef.current = onSave
  inspectRef.current = onInspect
  const localRef = useRef<ReturnType<typeof createPreferencesSaveQueue> | null>(
    null,
  )

  useEffect(() => {
    if (!session || !saveRef.current) return
    session.configure(
      (patch) => {
        const save = saveRef.current
        if (!save) throw new Error("Preferences save unavailable")
        return save(patch)
      },
      async () => {
        const inspect = inspectRef.current
        if (!inspect) throw new Error("Preferences Query unavailable")
        return inspect()
      },
    )
  }, [session])

  useEffect(() => {
    if (!session || !initialPreferences) return
    session.hydrate(initialPreferences)
  }, [session, initialPreferences])

  useEffect(() => {
    if (session || !saveRef.current) return
    let mounted = true
    const queue = createPreferencesSaveQueue(
      (patch) => {
        const save = saveRef.current
        if (!save) throw new Error("Preferences save unavailable")
        return save(patch)
      },
      () => {
        if (mounted) {
          setLocalError(null)
          setLocalBlockedFeedback(null)
          setLocalValidation(null)
        }
      },
      (error, attempted) => {
        if (!mounted) return
        const kind = classifySettingsSaveFailure(error)
        setLocalError(kind)
        setLocalBlockedFeedback(kind === "blocked" ? getPreferencesBlockedFeedback(error) : null)
        setLocalValidation(
          kind === "validation"
            ? resolveFormFailureValidation(getSettingsInputViolations(error), Object.keys(attempted))
            : null,
        )
      },
      400,
      (state) => {
        if (mounted) setLocalStatus(state)
      },
    )
    localRef.current = queue
    return () => {
      mounted = false
      // A paused failure is never retried by navigation.
      void queue.flush({ manual: false })
      localRef.current = null
    }
  }, [session])

  return {
    saveError: session ? snapshot.failure : localError,
    blockedFeedback: session ? snapshot.blockedFeedback : localBlockedFeedback,
    validation: session ? snapshot.validation : localValidation,
    saveStatus: session ? snapshot.saveStatus : localStatus,
    sessionSnapshot: session ? snapshot : null,
    enqueue: (patch: UserPreferencesPatch) => {
      if (session) session.edit(patch)
      else localRef.current?.enqueue(patch)
    },
    setAccentDraft: (value: string) => {
      session?.editAccentDraft(value)
    },
    retry: () => {
      if (session) session.retry()
      else {
        setLocalError(null)
        setLocalBlockedFeedback(null)
        setLocalValidation(null)
        void localRef.current?.flush()
      }
    },
    inspect: () => session?.inspect(),
    confirmObservation: () => session?.confirmObservation(),
    discard: () => session?.discard(),
  }
}
