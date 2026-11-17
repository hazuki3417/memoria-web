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

type SaveStatus =
  | { kind: "idle" | "saving" | "error" | "unknown" }
  | { kind: "blocked"; error: unknown }

/** Aliasのnull解除、未保存Draft、入力検証と明示保存を管理する。 */
export const useCommunityAliasForm = ({
  savedAlias,
  onSave,
  initialSaveState = "idle",
}: {
  savedAlias: string | null
  onSave: SaveCommunityAlias
  initialSaveState?: "idle" | "saving" | "blocked"
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
  const baseline = form.formState.defaultValues?.alias ?? ""
  const changed = normalized !== baseline.trim()
  const validation = communityAliasSchema.safeParse({ alias: text })
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
  const failure: "retryable" | "blocked" | "unknown" | null =
    status.kind === "error" ? "retryable"
    : status.kind === "blocked" ? "blocked"
    : status.kind === "unknown" ? "unknown" : null
  const blockedFeedback = status.kind === "blocked"
    ? getCommunityBlockedFeedback(status.error, "Community別名")
    : null

  const submitAlias = async ({ alias }: z.output<typeof communityAliasSchema>) => {
    if (process.getSnapshot().busy || blocked || unknown || status.kind === "saving" || !changed) return

    setFormInvalid(false)
    clearErrors("alias")
    const outcome = await process.submit(alias)
    if (!alive.current || outcome === null) return

    if (outcome.kind === "success") {
      reset({ alias: outcome.value ?? "" })
      clearErrors()
      setFormInvalid(false)
      setStatus({ kind: "idle" })
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
          setStatus({ kind: "error" })
          break
      }
    }
  }

  const onAliasChange = (event: ChangeEvent<HTMLInputElement>) => {
    field.onChange(event.currentTarget.value)
    clearErrors("alias")
    if (status.kind === "error") setStatus({ kind: "idle" })
    // Form Level Validationは次の保存まで維持する。
  }

  return {
    field, fieldState, text, saving, failure, formInvalid, blockedFeedback,
    normalized, validation, showClientError: fieldState.isTouched || form.formState.isSubmitted,
    changed, invalid, save: handleSubmit(submitAlias), onAliasChange, blocked, unknown,
    saveLabel: "保存",
  }
}
