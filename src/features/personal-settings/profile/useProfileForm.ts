"use client"

import { useEffect, useRef, useState, type ChangeEvent } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useController, useForm, useWatch } from "react-hook-form"
import type { z } from "zod"
import { showNotification } from "@/components/Feedback"
import { useExplicitSaveProcess } from "@/ui/Action"
import { resolveFormInputValidation } from "@/ui/formValidation"
import { profileSchema } from "./profileSchema"
import type { SaveProfile } from "./profileSaveOutcome"

type SaveStatus =
  | { kind: "idle" | "saving" | "error" | "unknown" }
  | { kind: "blocked"; error: unknown }

/** ProfileのNickname Draft・検証・明示保存を管理する。 */
export const useProfileForm = ({
  onSave,
  initialNickname,
  initialSaveState = "idle",
}: {
  onSave: SaveProfile
  initialNickname: string
  initialSaveState?: "idle" | "saving" | "blocked"
}) => {
  const form = useForm<z.input<typeof profileSchema>, unknown, z.output<typeof profileSchema>>({
    resolver: zodResolver(profileSchema),
    mode: "onChange",
    defaultValues: { nickname: initialNickname },
  })
  const { control, reset, handleSubmit, setError, clearErrors } = form
  const { field, fieldState } = useController({ control, name: "nickname" })
  const nickname = useWatch({ control, name: "nickname" }) ?? initialNickname
  const normalized = nickname.trim()
  const baseline = form.formState.defaultValues?.nickname ?? initialNickname
  const dirty = normalized !== baseline.trim()
  const validation = profileSchema.safeParse({ nickname })
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

  const submitNickname = async ({ nickname: input }: z.output<typeof profileSchema>) => {
    if (process.getSnapshot().busy || blocked || unknown || status.kind === "saving" || !dirty) return

    setFormInvalid(false)
    clearErrors("nickname")
    const outcome = await process.submit(input)
    if (!alive.current || outcome === null) return

    if (outcome.kind === "success") {
      reset({ nickname: outcome.value })
      clearErrors()
      setFormInvalid(false)
      setStatus({ kind: "idle" })
      showNotification({
        kind: "success",
        title: "プロフィールを保存",
        description: "プロフィールを更新しました。",
      })
    } else if (outcome.kind === "unknown") {
      setStatus({ kind: "unknown" })
    } else {
      const reason = outcome.reason
      switch (reason.kind) {
        case "validation": {
          const errors = resolveFormInputValidation({ violations: reason.violations }, ["nickname"])
          if (errors.fieldErrors.nickname) {
            setError("nickname", { type: "server", message: errors.fieldErrors.nickname })
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
    clearErrors("nickname")
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
    saveLabel: saving ? "更新中" : "更新",
    save: handleSubmit(submitNickname),
    onDraftChange,
  }
}
