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

type SaveStatus =
  | { kind: "idle" | "saving" | "error" | "unknown" }
  | { kind: "blocked"; error: unknown }

/** Community名のDraft・検証・明示保存を管理する。 */
export const useCommunityNameForm = ({
  onSave,
  initialName,
  initialSaveState = "idle",
}: {
  onSave: SaveCommunityName
  initialName: string
  initialSaveState?: "idle" | "saving" | "blocked"
}) => {
  const form = useForm<z.input<typeof communityNameSchema>, unknown, z.output<typeof communityNameSchema>>({
    resolver: zodResolver(communityNameSchema),
    mode: "onChange",
    defaultValues: { name: initialName },
  })
  const { control, reset, handleSubmit, setError, clearErrors } = form
  const { field, fieldState } = useController({ control, name: "name" })
  const name = useWatch({ control, name: "name" }) ?? initialName
  const normalized = name.trim()
  const baseline = form.formState.defaultValues?.name ?? initialName
  const dirty = normalized !== baseline.trim()
  const validation = communityNameSchema.safeParse({ name })
  const invalid = !validation.success

  const { process, snapshot: processState } = useExplicitSaveProcess({ execute: onSave })
  const [status, setStatus] = useState<SaveStatus>(
    initialSaveState === "blocked"
      ? { kind: "blocked", error: null }
      : { kind: initialSaveState },
  )
  const [formInvalid, setFormInvalid] = useState(false)
  const alive = useRef(true)

  useEffect(() => {
    alive.current = true
    return () => { alive.current = false }
  }, [])

  const saving = processState.busy || status.kind === "saving" || form.formState.isSubmitting
  const blocked = status.kind === "blocked"
  const unknown = status.kind === "unknown"

  const submitName = async ({ name: input }: z.output<typeof communityNameSchema>) => {
    if (process.getSnapshot().busy || blocked || unknown || status.kind === "saving" || !dirty) return

    setFormInvalid(false)
    clearErrors("name")
    const outcome = await process.submit(input)
    if (!alive.current || outcome === null) return

    if (outcome.kind === "success") {
      reset({ name: outcome.value })
      clearErrors()
      setFormInvalid(false)
      setStatus({ kind: "idle" })
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
          setStatus({ kind: "blocked", error: reason.error })
          break
        case "retryable":
          setStatus({ kind: "error" })
          break
      }
    }
  }

  const onDraftChange = (event: ChangeEvent<HTMLInputElement>) => {
    field.onChange(event)
    clearErrors("name")
    if (status.kind === "error") setStatus({ kind: "idle" })
  }

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
    formInvalid,
    normalized,
    saveLabel: "保存",
    save: handleSubmit(submitName),
    onDraftChange,
  }
}
