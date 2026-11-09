"use client"

import { resolveFormFailureValidation } from "@/ui/formValidation"
import { useEffect, useRef, useState, type ChangeEvent } from "react"
import { useController, useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import type { z } from "zod"
import { communityAliasSchema } from "./communityAliasSchema"
import { showNotification } from "@/components/Feedback"
import { getCommunityBlockedFeedback } from "../communityBlockedFeedback"
import { classifySettingsSaveFailure, getSettingsInputViolations, type SettingsSaveFailureKind } from "@/infrastructure/graphql/settingsMutationResult"

type Inspection =
  | { status: "idle" | "checking" | "failed" }
  | { status: "matches" | "differs"; alias: string | null }

/** Owns Community Alias input, save, unknown-outcome inspection and draft protection. */
export function useCommunityAliasForm({
  savedAlias,
  onSave,
  onInspect,
}: {
  savedAlias: string | null
  onSave: (alias: string | null) => Promise<void>
  onInspect?: () => Promise<string | null>
}) {
  const {
    control, getValues, reset, handleSubmit, setError, clearErrors,
    formState: { isSubmitted },
  } = useForm<
    z.input<typeof communityAliasSchema>,
    unknown,
    z.output<typeof communityAliasSchema>
  >({
    resolver: zodResolver(communityAliasSchema),
    mode: "onChange",
    defaultValues: { alias: savedAlias ?? "" },
  })
  const { field, fieldState } = useController({ control, name: "alias" })
  const [saving, setSaving] = useState(false)
  const [failure, setFailure] = useState<SettingsSaveFailureKind | null>(null)
  const [blockedFeedback, setBlockedFeedback] = useState<{ title: string; description: string } | null>(null)
  const [formInvalid, setFormInvalid] = useState(false)
  const [inspection, setInspection] = useState<Inspection>({ status: "idle" })
  const previousSourceAlias = useRef(savedAlias ?? "")
  const savedBaseline = useRef(savedAlias ?? "")
  const awaitingSourceEcho = useRef<string | null>(null)
  const inspectionGeneration = useRef(0)
  useEffect(() => () => { inspectionGeneration.current += 1 }, [])

  useEffect(() => {
    const source = savedAlias ?? ""
    if (previousSourceAlias.current === source) return
    previousSourceAlias.current = source
    if (failure === "unknown") return
    // Do not let a stale subscribed Query undo a confirmed save/observation.
    if (awaitingSourceEcho.current !== null) {
      if (source !== awaitingSourceEcho.current) return
      awaitingSourceEcho.current = null
    }
    const draftIsEdited = getValues("alias").trim() !== savedBaseline.current
    savedBaseline.current = source
    if (!draftIsEdited && !saving) reset({ alias: source })
  }, [savedAlias, getValues, reset, saving, failure])

  const text = field.value
  const normalized = text.trim()
  const validation = communityAliasSchema.safeParse({ alias: text })
  const changed = normalized !== savedBaseline.current
  const invalid = !validation.success
  const showClientError = fieldState.isTouched || isSubmitted
  const canResaveInspected =
    failure === "unknown" &&
    inspection.status === "differs" &&
    !invalid &&
    normalized !== (inspection.alias ?? "")

  const adoptCurrentAlias = (alias: string | null) => {
    inspectionGeneration.current += 1
    const value = alias ?? ""
    savedBaseline.current = value
    awaitingSourceEcho.current = value === (savedAlias ?? "") ? null : value
    reset({ alias: value })
    setFailure(null)
    setFormInvalid(false)
    setBlockedFeedback(null)
    clearErrors("alias")
    setInspection({ status: "idle" })
  }

  const save = handleSubmit(async ({ alias }) => {
    if (
      saving ||
      failure === "blocked" ||
      (failure === "unknown" && !canResaveInspected) ||
      (!changed && !canResaveInspected)
    ) return

    inspectionGeneration.current += 1
    setInspection({ status: "idle" })
    setSaving(true)
    setFailure(null)
    setBlockedFeedback(null)
    setFormInvalid(false)
    clearErrors("alias")
    try {
      await onSave(alias)
      adoptCurrentAlias(alias)
      showNotification({
        kind: "success",
        title: "Community別名を保存",
        description: alias ? "別名を変更しました。" : "別名を解除しました。",
      })
    } catch (error) {
      const kind = classifySettingsSaveFailure(error)
      if (kind === "validation") {
        const result = resolveFormFailureValidation(getSettingsInputViolations(error), ["alias"])
        if (result.fieldErrors.alias) {
          setError("alias", { type: "server", message: result.fieldErrors.alias })
        }
        setFormInvalid(result.formError)
      } else {
        setFailure(kind)
        if (kind === "blocked") {
          setBlockedFeedback(getCommunityBlockedFeedback(error, "Community別名"))
        }
      }
    } finally {
      setSaving(false)
    }
  })

  const inspect = async () => {
    if (failure !== "unknown" || !onInspect || inspection.status === "checking") return
    const generation = ++inspectionGeneration.current
    const draftAtStart = getValues("alias").trim()
    setInspection({ status: "checking" })
    try {
      const server = await onInspect()
      if (
        generation !== inspectionGeneration.current ||
        getValues("alias").trim() !== draftAtStart
      ) return
      setInspection({
        status: (server ?? "") === draftAtStart ? "matches" : "differs",
        alias: server,
      })
    } catch {
      if (
        generation !== inspectionGeneration.current ||
        getValues("alias").trim() !== draftAtStart
      ) return
      setInspection({ status: "failed" })
    }
  }

  const confirmObservation = () => {
    if (failure !== "unknown" || inspection.status !== "matches") return
    if ((inspection.alias ?? "") !== getValues("alias").trim()) return
    // Matching values are an observation, never success proof for the old write.
    adoptCurrentAlias(inspection.alias)
  }

  const discardUnconfirmed = () => {
    if (failure !== "unknown" || inspection.status !== "differs") return
    adoptCurrentAlias(inspection.alias)
  }

  const onAliasChange = (event: ChangeEvent<HTMLInputElement>) => {
    field.onChange(event.currentTarget.value)
    clearErrors("alias")
    if (failure === "unknown") {
      inspectionGeneration.current += 1
      setInspection({ status: "idle" })
    }
    // Form-level rejections remain visible until another submit.
  }

  return {
    field, fieldState, text, saving, failure, formInvalid, blockedFeedback,
    inspection, inspect, canResaveInspected, confirmObservation,
    discardUnconfirmed, normalized, validation, showClientError,
    changed, invalid, save, onAliasChange,
  }
}
