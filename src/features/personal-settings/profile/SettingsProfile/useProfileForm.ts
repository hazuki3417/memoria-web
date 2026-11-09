"use client"

import { useEffect, useRef, useState, type ChangeEvent } from "react"
import { useController, useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import type { z } from "zod"
import { resolveFormFailureValidation } from "@/ui/formValidation"
import { profileSchema } from "./profileSchema"
import { getProfileBlockedFeedback, type ProfileBlockedFeedback } from "./profileBlockedFeedback"
import { showNotification } from "@/components/Feedback"
import { classifySettingsSaveFailure, getSettingsInputViolations } from "@/infrastructure/graphql/settingsMutationResult"

export type SaveProfile = (nickname: string) => Promise<void>
export type InspectProfile = () => Promise<string>

type Inspection =
  | { status: "idle" | "checking" | "failed" }
  | { status: "matches" | "differs"; nickname: string }

/** Owns Profile form draft, save/inspection state and stale-query protection. */
export function useProfileForm({
  onSave,
  onInspect,
  initialNickname,
  initialSaveState,
  blockedMessage,
}: {
  onSave: SaveProfile
  onInspect?: InspectProfile
  initialNickname: string
  initialSaveState: "idle" | "saving" | "retryable-error" | "blocked"
  blockedMessage: string
}) {
  const {
    control,
    reset,
    getValues,
    handleSubmit,
    setError,
    clearErrors,
    formState: { isSubmitted },
  } = useForm<
    z.input<typeof profileSchema>,
    unknown,
    z.output<typeof profileSchema>
  >({
    resolver: zodResolver(profileSchema),
    mode: "onChange",
    defaultValues: { nickname: initialNickname },
  })
  const { field, fieldState } = useController({ control, name: "nickname" })
  const saved = useRef(initialNickname)
  const previousSourceNickname = useRef(initialNickname)
  // Keep a newly confirmed name authoritative until the shared Query echoes it.
  const awaitingSourceEcho = useRef<string | null>(null)
  const inspectionGeneration = useRef(0)

  const [saveState, setSaveState] = useState<
    "idle" | "saving" | "retryable-error" | "blocked" | "unknown"
  >(initialSaveState)
  const [formInvalid, setFormInvalid] = useState(false)
  const [blockedFeedback, setBlockedFeedback] =
    useState<ProfileBlockedFeedback | null>(null)
  const [inspection, setInspection] = useState<Inspection>({ status: "idle" })

  useEffect(() => () => {
    inspectionGeneration.current += 1
  }, [])

  // Untouched Draft follows fresh data. In-flight / failed / unknown Drafts do
  // not get replaced by a background Query. A stale cache echo cannot undo a
  // successful save or an explicitly confirmed server observation.
  useEffect(() => {
    if (previousSourceNickname.current === initialNickname) return
    previousSourceNickname.current = initialNickname
    if (saveState === "unknown") return
    if (awaitingSourceEcho.current !== null) {
      if (initialNickname !== awaitingSourceEcho.current) return
      awaitingSourceEcho.current = null
    }
    const draftIsEdited = getValues("nickname").trim() !== saved.current
    saved.current = initialNickname
    if (
      !draftIsEdited &&
      saveState !== "saving" &&
      saveState !== "retryable-error"
    ) {
      reset({ nickname: initialNickname })
    }
  }, [initialNickname, getValues, reset, saveState])

  const validation = profileSchema.safeParse({ nickname: field.value })
  const normalized = field.value.trim()
  const dirty = normalized !== saved.current
  const invalid = !validation.success
  const showClientError = fieldState.isTouched || isSubmitted
  const isSaving = saveState === "saving"
  const isBlocked = saveState === "blocked"
  const isUnknown = saveState === "unknown"
  const canRetryInspected =
    isUnknown &&
    inspection.status === "differs" &&
    !invalid &&
    normalized !== inspection.nickname

  let saveLabel = "更新"
  if (saveState === "retryable-error") {
    saveLabel = "再試行"
  } else if (isSaving) {
    saveLabel = "更新中"
  }

  function adoptCurrentNickname(nickname: string) {
    inspectionGeneration.current += 1
    saved.current = nickname
    awaitingSourceEcho.current = initialNickname === nickname ? null : nickname
    reset({ nickname })
    setInspection({ status: "idle" })
    setSaveState("idle")
    setFormInvalid(false)
    clearErrors("nickname")
  }

  const save = handleSubmit(async ({ nickname }) => {
    if (
      isSaving ||
      isBlocked ||
      (isUnknown && !canRetryInspected) ||
      (!dirty && !canRetryInspected)
    )
      return

    inspectionGeneration.current += 1
    setInspection({ status: "idle" })
    setSaveState("saving")
    setBlockedFeedback(null)
    setFormInvalid(false)
    clearErrors("nickname")
    try {
      await onSave(nickname)
      adoptCurrentNickname(nickname)
      showNotification({
        kind: "success",
        title: "プロフィールを保存",
        description: "プロフィールを更新しました。",
      })
    } catch (error) {
      const kind = classifySettingsSaveFailure(error)
      if (kind === "validation") {
        const result = resolveFormFailureValidation(getSettingsInputViolations(error), ["nickname"])
        if (result.fieldErrors.nickname) {
          setError("nickname", {
            type: "server",
            message: result.fieldErrors.nickname,
          })
        }
        setFormInvalid(result.formError)
        setSaveState("idle")
      } else if (kind === "blocked") {
        setBlockedFeedback(getProfileBlockedFeedback(error, blockedMessage))
        setSaveState("blocked")
      } else {
        setSaveState(kind === "retryable" ? "retryable-error" : "unknown")
      }
    }
  })

  async function inspectCurrentProfile() {
    if (!isUnknown || !onInspect || inspection.status === "checking") return
    const generation = ++inspectionGeneration.current
    const draftAtStart = getValues("nickname").trim()
    setInspection({ status: "checking" })
    try {
      const currentNickname = await onInspect()
      if (
        generation !== inspectionGeneration.current ||
        getValues("nickname").trim() !== draftAtStart
      )
        return
      setInspection({
        status: currentNickname === draftAtStart ? "matches" : "differs",
        nickname: currentNickname,
      })
    } catch {
      if (
        generation !== inspectionGeneration.current ||
        getValues("nickname").trim() !== draftAtStart
      )
        return
      setInspection({ status: "failed" })
    }
  }

  function confirmObservedProfile() {
    if (
      !isUnknown ||
      inspection.status !== "matches" ||
      inspection.nickname !== getValues("nickname").trim()
    )
      return
    // A matching read is an observation, NOT evidence that the old write
    // succeeded. Intentionally do not emit a success Notification here.
    adoptCurrentNickname(inspection.nickname)
  }

  function discardUnconfirmedDraft() {
    if (!isUnknown || inspection.status !== "differs") return
    // Discard is an explicit decision to adopt the inspected server value.
    adoptCurrentNickname(inspection.nickname)
  }


  const onDraftChange = (event: ChangeEvent<HTMLInputElement>) => {
    field.onChange(event)
    clearErrors("nickname")
    if (isUnknown) {
      inspectionGeneration.current += 1
      setInspection({ status: "idle" })
    }
    // A form-level server rejection remains visible until another
    // confirmed submit. Editing alone cannot prove it is resolved.
  }

  return {
    field,
    fieldState,
    validation,
    normalized,
    dirty,
    invalid,
    showClientError,
    isSaving,
    isBlocked,
    isUnknown,
    canRetryInspected,
    saveLabel,
    saveState,
    formInvalid,
    blockedFeedback,
    inspection,
    save,
    inspectCurrentProfile,
    confirmObservedProfile,
    discardUnconfirmedDraft,
    onDraftChange,
  }
}
