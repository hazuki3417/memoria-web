"use client"

import { useEffect, useRef, useState, type ChangeEvent } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useController, useForm, useWatch } from "react-hook-form"
import type { z } from "zod"
import { showNotification } from "@/components/Feedback"
import { useExplicitSaveProcess } from "@/ui/Action"
import { resolveFormInputValidation } from "@/ui/formValidation"
import { communityNameSchema } from "./communityNameSchema"
import type { SaveCommunityName } from "./communityNameSaveOutcome"

export type InspectCommunityName = () => Promise<string>

type SaveStatus =
  | { kind: "idle" | "saving" | "retryable-error" | "unknown" }
  | { kind: "blocked"; error: unknown }

/** Community名編集のDraft・入力検証・明示保存・結果不明時の復旧を管理する。 */
export const useCommunityNameForm = ({
  onSave,
  onInspect,
  initialName,
  initialSaveState = "idle",
}: {
  onSave: SaveCommunityName
  onInspect?: InspectCommunityName
  initialName: string
  initialSaveState?: "idle" | "saving" | "retryable-error" | "blocked"
}) => {
  const form = useForm<
    z.input<typeof communityNameSchema>,
    unknown,
    z.output<typeof communityNameSchema>
  >({
    resolver: zodResolver(communityNameSchema),
    mode: "onChange",
    defaultValues: { name: initialName },
  })
  const { control, reset, getValues, handleSubmit, setError, clearErrors } = form
  const { field, fieldState } = useController({ control, name: "name" })
  const name = useWatch({ control, name: "name" }) ?? initialName
  const normalized = name.trim()
  const baseline = form.formState.defaultValues?.name ?? initialName
  const dirty = normalized !== baseline.trim()
  const validation = communityNameSchema.safeParse({ name })
  const invalid = !validation.success

  const matchesName = (observed: string, submitted: string) => {
    return observed === submitted
  }

  const { process, snapshot: processState } = useExplicitSaveProcess({
    execute: onSave,
    recovery: onInspect
      ? { inspect: onInspect, matches: matchesName }
      : undefined,
  })

  const [status, setStatus] = useState<SaveStatus>(
    initialSaveState === "blocked"
      ? { kind: "blocked", error: null }
      : { kind: initialSaveState },
  )
  const [formInvalid, setFormInvalid] = useState(false)
  const alive = useRef(true)
  const queryEcho = useRef({ observed: initialName, confirmed: null as string | null })

  useEffect(() => {
    alive.current = true
    return () => {
      alive.current = false
    }
  }, [])

  useEffect(() => {
    if (queryEcho.current.observed === initialName) return
    queryEcho.current.observed = initialName
    if (queryEcho.current.confirmed !== null) {
      if (initialName !== queryEcho.current.confirmed) return
      queryEcho.current.confirmed = null
    }
    if (!form.formState.isDirty && !processState.busy && status.kind === "idle") {
      reset({ name: initialName })
    }
  }, [initialName, form.formState.isDirty, reset, processState.busy, status.kind])

  const saving = processState.busy || status.kind === "saving" || form.formState.isSubmitting
  const blocked = status.kind === "blocked"
  const unknown = status.kind === "unknown"
  const inspection = processState.inspection
  const canRetryInspected =
    unknown &&
    inspection.kind === "differs" &&
    !invalid &&
    normalized !== inspection.value

  const adopt = (value: string) => {
    process.invalidateInspection()
    queryEcho.current.confirmed = value === initialName ? null : value
    reset({ name: value })
    clearErrors()
    setFormInvalid(false)
    setStatus({ kind: "idle" })
  }

  const submitName = async ({ name: input }: z.output<typeof communityNameSchema>) => {
    if (
      process.getSnapshot().busy ||
      blocked ||
      status.kind === "saving" ||
      (unknown && !canRetryInspected) ||
      (!dirty && !canRetryInspected)
    ) return

    setFormInvalid(false)
    clearErrors("name")
    const outcome = await process.submit(input)
    if (!alive.current || outcome === null) return

    if (outcome.kind === "success") {
      adopt(outcome.value)
      showNotification({
        kind: "success",
        title: "Community名を変更",
        description: "Community名を変更しました。",
      })
    } else if (outcome.kind === "unknown") {
      setStatus({ kind: "unknown" })
    } else {
      const reason = outcome.reason
      switch (reason.kind) {
        case "validation": {
          const errors = resolveFormInputValidation({ violations: reason.violations }, ["name"])
          if (errors.fieldErrors.name) {
            setError("name", { type: "server", message: errors.fieldErrors.name })
          }
          setFormInvalid(errors.formError)
          setStatus({ kind: "idle" })
          break
        }
        case "blocked":
          setStatus({
            kind: "blocked",
            error: reason.error,
          })
          break
        case "retryable":
          setStatus({ kind: "retryable-error" })
          break
      }
    }
  }

  const save = handleSubmit(submitName)

  const inspectCurrentCommunityName = async () => {
    if (!unknown || !onInspect || inspection.kind === "checking") return
    await process.inspect(getValues("name").trim())
  }

  const confirmObservedCommunityName = () => {
    if (
      unknown &&
      inspection.kind === "matches" &&
      getValues("name").trim() === inspection.value
    ) {
      // 現在値が一致しても以前のMutationが成功した証拠にはならない。
      adopt(inspection.value)
    }
  }

  const discardUnconfirmedDraft = () => {
    if (unknown && inspection.kind === "differs") adopt(inspection.value)
  }

  const onDraftChange = (event: ChangeEvent<HTMLInputElement>) => {
    field.onChange(event)
    clearErrors("name")
    if (status.kind === "unknown") process.invalidateInspection()
  }

  /** 入力状態と検証結果、保存可否・Feedback状態、保存・復旧に必要な画面操作を提供する。 */
  return {
    field,
    fieldState,
    validation,
    dirty,
    invalid,
    showClientError: fieldState.isTouched || form.formState.isSubmitted,
    saving,
    blocked,
    unknown,
    status,
    inspection,
    formInvalid,
    normalized,
    canRetryInspected,
    saveLabel: status.kind === "retryable-error" ? "再試行" : "保存",
    save,
    onDraftChange,
    inspectCurrentCommunityName,
    confirmObservedCommunityName,
    discardUnconfirmedDraft,
  }
}
