"use client"

import { resolveFormFailureValidation } from "@/ui/formValidation"

import { useEffect, useRef, useState, type SetStateAction } from "react"
import { useController, useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import type { z } from "zod"
import { communityNameSchema } from "./communityNameSchema"
import { showNotification } from "@/components/Feedback"
import {
  classifySettingsSaveFailure,
  getSettingsInputViolations,
  type SettingsSaveFailureKind,
} from "@/infrastructure/graphql/settingsMutationResult"
import { getCommunityBlockedFeedback } from "../preferences/communityBlockedFeedback"

type Inspection =
  | { status: "idle" | "checking" | "failed" }
  | { status: "matches" | "differs"; name: string }

/** Manual Community name save; the Form owns its Draft and recovery state. */
export function useCommunityNameSettings({
  communityName,
  onSaveName,
  onInspectName,
}: {
  communityName?: string
  onSaveName?: (name: string) => Promise<string>
  onInspectName?: () => Promise<string>
}) {
  const initialName = communityName ?? "家族のアルバム"
  const {
    control, reset, getValues, handleSubmit, setError, clearErrors,
    formState: { isSubmitted },
  } = useForm<
    z.input<typeof communityNameSchema>,
    unknown,
    z.output<typeof communityNameSchema>
  >({
    resolver: zodResolver(communityNameSchema),
    mode: "onChange",
    defaultValues: { name: initialName },
  })
  const { field, fieldState } = useController({ control, name: "name" })
  const savedName = useRef(initialName)
  const previousSource = useRef(communityName)
  const awaitingSourceEcho = useRef<string | null>(null)
  const inspectionGeneration = useRef(0)
  const [savingName, setSavingName] = useState(false)
  const [failure, setFailure] = useState<SettingsSaveFailureKind | null>(null)
  const [blockedFeedback, setBlockedFeedback] = useState<{ title: string; description: string } | null>(null)
  const [formInvalid, setFormInvalid] = useState(false)
  const [inspection, setInspection] = useState<Inspection>({ status: "idle" })
  useEffect(() => () => { inspectionGeneration.current += 1 }, [])

  // Protect edited/unknown drafts and confirmed writes from stale refetches.
  useEffect(() => {
    if (communityName === undefined || previousSource.current === communityName)
      return
    previousSource.current = communityName
    if (failure === "unknown") return
    if (awaitingSourceEcho.current !== null) {
      if (communityName !== awaitingSourceEcho.current) return
      awaitingSourceEcho.current = null
    }
    const draftIsEdited = getValues("name").trim() !== savedName.current
    savedName.current = communityName
    if (!draftIsEdited && !savingName) reset({ name: communityName })
  }, [communityName, failure, savingName, getValues, reset])

  const draft = field.value
  const dirty = draft.trim() !== savedName.current
  const invalid = !communityNameSchema.safeParse({ name: draft }).success
  const canResaveInspected =
    failure === "unknown" &&
    inspection.status === "differs" &&
    !invalid &&
    draft.trim() !== inspection.name

  const setDraft = (next: SetStateAction<string>) => {
    field.onChange(typeof next === "function" ? next(field.value) : next)
    clearErrors("name")
    if (failure === "unknown") {
      inspectionGeneration.current += 1
      setInspection({ status: "idle" })
    }
    // A server Form error is not resolved merely by editing. Retain the
    // persistent explanation until the next confirmed submit.
  }

  const saveName = () => {
    if (
      savingName ||
      failure === "blocked" ||
      (failure === "unknown" && !canResaveInspected)
    ) return
    void handleSubmit(async ({ name: updated }) => {
      if (updated === savedName.current && !canResaveInspected) return
      inspectionGeneration.current += 1
      setInspection({ status: "idle" })
      setSavingName(true)
      setFailure(null)
      setBlockedFeedback(null)
      setFormInvalid(false)
      clearErrors("name")
      try {
        const confirmed = onSaveName ? await onSaveName(updated) : updated
        savedName.current = confirmed
        awaitingSourceEcho.current = communityName === confirmed ? null : confirmed
        if (getValues("name").trim() === updated) reset({ name: confirmed })
        showNotification({
          kind: "success",
          title: "Community名を変更",
          description: "Community名を変更しました。",
        })
      } catch (error) {
        const kind = classifySettingsSaveFailure(error)
        if (kind === "validation") {
          const result = resolveFormFailureValidation(getSettingsInputViolations(error), ["name"])
          if (result.fieldErrors.name) {
            setError("name", { type: "server", message: result.fieldErrors.name })
          }
          setFormInvalid(result.formError)
        } else {
          setFailure(kind)
          if (kind === "blocked") {
            setBlockedFeedback(getCommunityBlockedFeedback(error, "Community名"))
          }
        }
      } finally {
        setSavingName(false)
      }
    })()
  }

  const inspectName = async () => {
    if (failure !== "unknown" || !onInspectName || inspection.status === "checking")
      return
    const generation = ++inspectionGeneration.current
    const draftAtStart = getValues("name").trim()
    setInspection({ status: "checking" })
    try {
      const current = await onInspectName()
      if (
        generation !== inspectionGeneration.current ||
        getValues("name").trim() !== draftAtStart
      ) return
      setInspection({
        status: current === draftAtStart ? "matches" : "differs",
        name: current,
      })
    } catch {
      if (
        generation !== inspectionGeneration.current ||
        getValues("name").trim() !== draftAtStart
      ) return
      setInspection({ status: "failed" })
    }
  }

  const adoptCurrentName = (current: string) => {
    inspectionGeneration.current += 1
    savedName.current = current
    awaitingSourceEcho.current = communityName === current ? null : current
    reset({ name: current })
    clearErrors("name")
    setFailure(null)
    setFormInvalid(false)
    setInspection({ status: "idle" })
  }

  const confirmObservation = () => {
    if (failure !== "unknown" || inspection.status !== "matches") return
    if (inspection.name !== getValues("name").trim()) return
    // A matching read proves only the current value, not the old Mutation.
    adoptCurrentName(inspection.name)
  }
  const discardUnconfirmed = () => {
    if (failure !== "unknown" || inspection.status !== "differs") return
    adoptCurrentName(inspection.name)
  }

  const showClientError = fieldState.isTouched || isSubmitted
  const saveFeedback = formInvalid
    ? {
        kind: "error" as const,
        title: "入力内容を確認してください",
        description: "入力した値を受け付けられませんでした。内容を見直し、もう一度保存してください。",
      }
    : failure === "blocked"
      ? {
          kind: "error" as const,
          title: blockedFeedback?.title ?? "Community名を変更できません",
          description: blockedFeedback?.description ?? "画面を再読み込みして現在の状態を確認してください。",
        }
      : failure === "unknown"
        ? {
            kind: "warning" as const,
            title: "保存結果を確認できませんでした",
            description:
              inspection.status === "matches"
                ? "現在のCommunity名は入力内容と一致しています。元の保存処理が成功した証明ではありません。確認した場合は「確認完了」を選んでください。"
                : inspection.status === "differs"
                  ? `現在のCommunity名は「${inspection.name}」です。入力した「${draft.trim()}」とは異なります。必要な場合だけ再保存するか、変更を破棄してください。`
                  : inspection.status === "failed"
                    ? "現在のCommunity名を取得できませんでした。保存を再送せず、状態の確認をやり直してください。"
                    : onInspectName
                      ? "入力内容は保持しています。保存結果は未確定です。現在の状態を確認してから復旧操作を選んでください。"
                      : "入力内容は保持しています。保存結果は未確定です。入力内容を控えてから再読み込みしてください。",
          }
        : failure === "retryable"
          ? {
              kind: "error" as const,
              title: "保存できませんでした",
              description: "入力内容は保持されています。下の「保存」ボタンで再試行できます。",
            }
          : null

  return {
    draft, setDraft, dirty, invalid, savingName, saveName,
    fieldError: fieldState.error?.type === "server"
      ? fieldState.error.message
      : showClientError && invalid
        ? "Community名を入力してください"
        : undefined,
    onNameBlur: field.onBlur,
    saveFeedback,
    saveBlocked: failure === "blocked" || failure === "unknown",
    inspectName: onInspectName ? inspectName : undefined,
    inspection,
    confirmObservation,
    discardUnconfirmed,
    canResaveInspected,
    unknown: failure === "unknown",
  }
}
