"use client"

import { useEffect, useRef, useState, type ChangeEvent } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useController, useForm, useWatch } from "react-hook-form"
import type { z } from "zod"
import { showNotification } from "@/components/Feedback"
import { useExplicitSaveProcess } from "@/ui/Action"
import { resolveFormInputValidation } from "@/ui/formValidation"
import { getCommunityBlockedFeedback } from "../../communityBlockedFeedback"
import { communityAliasSchema } from "./communityAliasSchema"
import type { SaveCommunityAlias } from "./communityAliasSaveOutcome"

export type InspectCommunityAlias = () => Promise<string | null>

type Inspection =
  | { status: "idle" | "checking" | "failed" }
  | { status: "matches" | "differs"; alias: string | null }

type SaveStatus =
  | { kind: "idle" | "saving" | "retryable-error" | "unknown" }
  | { kind: "blocked"; error: unknown }

/** Aliasのnull解除、編集中Draft、結果不明時の観測と明示復旧を所有する。 */
export const useCommunityAliasForm = ({
  savedAlias,
  onSave,
  onInspect,
  initialSaveState = "idle",
}: {
  savedAlias: string | null
  onSave: SaveCommunityAlias
  onInspect?: InspectCommunityAlias
  initialSaveState?: "idle" | "saving" | "retryable-error" | "blocked"
}) => {
  const form = useForm<
    z.input<typeof communityAliasSchema>,
    unknown,
    z.output<typeof communityAliasSchema>
  >({
    resolver: zodResolver(communityAliasSchema),
    mode: "onChange",
    defaultValues: { alias: savedAlias ?? "" },
  })
  const { control, reset, handleSubmit, setError, clearErrors } = form
  const { field, fieldState } = useController({ control, name: "alias" })
  const text = useWatch({ control, name: "alias" }) ?? ""
  const normalized = text.trim()
  const inputAlias = normalized || null
  const baseline = form.formState.defaultValues?.alias ?? ""
  const changed = normalized !== baseline.trim()
  const validation = communityAliasSchema.safeParse({ alias: text })
  const invalid = !validation.success

  const matchesAlias = (observed: string | null, submitted: string | null) => {
    return observed === submitted
  }
  const { process, snapshot: processState } = useExplicitSaveProcess({
    execute: onSave,
    recovery: onInspect ? { inspect: onInspect, matches: matchesAlias } : undefined,
  })
  const [status, setStatus] = useState<SaveStatus>(
    initialSaveState === "blocked"
      ? { kind: "blocked", error: null }
      : { kind: initialSaveState },
  )
  const [formInvalid, setFormInvalid] = useState(false)
  const alive = useRef(true)
  const queryEcho = useRef({
    observed: savedAlias,
    confirmed: null as string | null,
    awaiting: false,
  })

  useEffect(() => {
    alive.current = true
    return () => { alive.current = false }
  }, [])

  useEffect(() => {
    if (queryEcho.current.observed === savedAlias) return
    queryEcho.current.observed = savedAlias
    if (queryEcho.current.awaiting) {
      if (savedAlias !== queryEcho.current.confirmed) return
      queryEcho.current.awaiting = false
    }
    if (!changed && !processState.busy && status.kind === "idle") {
      reset({ alias: savedAlias ?? "" })
    }
  }, [savedAlias, changed, reset, processState.busy, status.kind])

  const saving = processState.busy || status.kind === "saving" || form.formState.isSubmitting
  const blocked = status.kind === "blocked"
  const unknown = status.kind === "unknown"
  const inspection = processState.inspection
  const failure: "retryable" | "blocked" | "unknown" | null = status.kind === "retryable-error" ? "retryable"
    : status.kind === "blocked" ? "blocked"
    : status.kind === "unknown" ? "unknown" : null
  const blockedFeedback = status.kind === "blocked"
    ? getCommunityBlockedFeedback(status.error, "Community別名")
    : null
  const canResaveInspected =
    unknown &&
    inspection.kind === "differs" &&
    !invalid &&
    inputAlias !== (inspection.kind === "differs" ? inspection.value : null)

  const adopt = (alias: string | null) => {
    process.invalidateInspection()
    queryEcho.current.confirmed = alias
    queryEcho.current.awaiting = alias !== savedAlias
    reset({ alias: alias ?? "" })
    clearErrors()
    setFormInvalid(false)
    setStatus({ kind: "idle" })
  }

  const submitAlias = async ({ alias }: z.output<typeof communityAliasSchema>) => {
    if (
      process.getSnapshot().busy || blocked || status.kind === "saving" ||
      (unknown && !canResaveInspected) || (!changed && !canResaveInspected)
    ) return

    setFormInvalid(false)
    clearErrors("alias")
    const outcome = await process.submit(alias)
    if (!alive.current || outcome === null) return

    if (outcome.kind === "success") {
      adopt(outcome.value)
      showNotification({
        kind: "success",
        title: "Community別名を保存",
        description: outcome.value ? "別名を変更しました。" : "別名を解除しました。",
      })
    } else if (outcome.kind === "unknown") {
      setStatus({ kind: "unknown" })
    } else {
      const reason = outcome.reason
      switch (reason.kind) {
        case "validation": {
          const errors = resolveFormInputValidation({ violations: reason.violations }, ["alias"])
          if (errors.fieldErrors.alias) {
            setError("alias", { type: "server", message: errors.fieldErrors.alias })
          }
          setFormInvalid(errors.formError)
          setStatus({ kind: "idle" })
          break
        }
        case "blocked":
          setStatus({ kind: "blocked", error: reason.error })
          break
        case "retryable":
          setStatus({ kind: "retryable-error" })
          break
      }
    }
  }

  const save = handleSubmit(submitAlias)

  const inspect = async () => {
    if (!unknown || !onInspect || inspection.kind === "checking") return
    await process.inspect(inputAlias)
  }
  const confirmObservation = () => {
    if (
      unknown && inspection.kind === "matches" &&
      inputAlias === inspection.value
    ) adopt(inspection.value)
  }
  const discardUnconfirmed = () => {
    if (unknown && inspection.kind === "differs") adopt(inspection.value)
  }
  const onAliasChange = (event: ChangeEvent<HTMLInputElement>) => {
    field.onChange(event.currentTarget.value)
    clearErrors("alias")
    if (unknown) process.invalidateInspection()
    // Form Level Validationは次の保存まで維持する。
  }

  const displayedInspection: Inspection = inspection.kind === "matches" || inspection.kind === "differs"
    ? { status: inspection.kind, alias: inspection.value }
    : { status: inspection.kind }

  /** Formの値・保存状態・復旧操作をUIに渡す。 */
  return {
    field, fieldState, text, saving, failure, formInvalid, blockedFeedback,
    inspection: displayedInspection,
    inspect, canResaveInspected, confirmObservation, discardUnconfirmed,
    normalized, validation, showClientError: fieldState.isTouched || form.formState.isSubmitted,
    changed, invalid, save, onAliasChange, blocked, unknown,
    saveLabel: "保存",
  }
}
