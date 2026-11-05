"use client"

import { Box, Button, Stack, TextInput } from "@mantine/core"
import { useEffect, useRef, useState } from "react"
import { useController, useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import type { z } from "zod"
import { communityAliasSchema } from "../communityAliasSchema"
import { FeedbackPanel, showNotification } from "@/components/Feedback"
import { getCommunityBlockedFeedback } from "../communityBlockedFeedback"
import {
  classifySettingsSaveFailure,
  resolveSettingsFailureValidation,
  type SettingsSaveFailureKind,
} from "@/features/settings/graphqlSettingsResult"

type Inspection =
  | { status: "idle" | "checking" | "failed" }
  | { status: "matches" | "differs"; alias: string | null }

export function CommunityAliasControl({
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
        const result = resolveSettingsFailureValidation(error, ["alias"])
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

  return (
    <Stack gap="md" maw={540}>
      <TextInput
        label="Community別名"
        description="自分だけに表示される名前です。空欄で保存すると正式名称が表示されます。"
        aria-label="Community別名"
        placeholder="別名を入力"
        name={field.name}
        ref={field.ref}
        onBlur={field.onBlur}
        value={text}
        disabled={saving}
        onChange={(event) => {
          field.onChange(event.currentTarget.value)
          clearErrors("alias")
          if (failure === "unknown") {
            inspectionGeneration.current += 1
            setInspection({ status: "idle" })
          }
          // Form-level rejections remain visible until another submit.
        }}
        error={
          fieldState.error?.type === "server"
            ? fieldState.error.message
            : showClientError && !validation.success
              ? validation.error.issues[0]?.message
              : undefined
        }
      />
      {(failure || formInvalid) && (
        <FeedbackPanel
          kind={failure === "unknown" ? "warning" : "error"}
          role="alert"
          title={
            failure === "unknown"
              ? "保存結果を確認できませんでした"
              : failure === "blocked"
                ? blockedFeedback?.title ?? "Community別名を変更できません"
                : formInvalid
                  ? "入力内容を確認してください"
                  : "保存できませんでした"
          }
          actions={
            failure === "unknown" && onInspect ? (
              <>
                <Button
                  size="xs"
                  variant="light"
                  loading={inspection.status === "checking"}
                  onClick={() => void inspect()}
                >
                  {inspection.status === "matches" || inspection.status === "differs"
                    ? "もう一度確認"
                    : "現在の状態を確認"}
                </Button>
                {inspection.status === "matches" && (
                  <Button size="xs" onClick={confirmObservation}>確認完了</Button>
                )}
                {inspection.status === "differs" && (
                  <>
                    <Button
                      size="xs"
                      disabled={!canResaveInspected}
                      onClick={() => void save()}
                    >
                      もう一度保存
                    </Button>
                    <Button
                      size="xs"
                      variant="subtle"
                      color="gray"
                      onClick={discardUnconfirmed}
                    >
                      変更を破棄
                    </Button>
                  </>
                )}
              </>
            ) : undefined
          }
        >
          {failure === "unknown"
            ? inspection.status === "matches"
              ? "現在のCommunity別名は入力内容と一致しています。元の保存処理が成功した証明ではありません。確認した場合は「確認完了」を選んでください。"
              : inspection.status === "differs"
                ? `現在のCommunity別名は「${inspection.alias ?? "設定なし"}」です。入力した「${normalized || "設定なし"}」とは異なります。必要な場合だけもう一度保存するか変更を破棄してください。`
                : inspection.status === "failed"
                  ? "現在のCommunity別名を取得できませんでした。保存を再送せず、状態の確認をやり直してください。"
                  : onInspect
                    ? "入力内容を保持しています。保存結果は未確定です。現在の状態を確認してから復旧操作を選んでください。"
                    : "入力内容を保持しています。保存結果は未確定です。入力内容を控えてから再読み込みしてください。"
            : failure === "blocked"
              ? blockedFeedback?.description ?? "入力内容を保持しています。権限とアカウントの状態を確認してください。"
              : formInvalid
                ? "入力した値を受け付けられませんでした。内容を見直して、もう一度保存してください。"
                : "入力内容を保持しています。再度保存してください。"}
        </FeedbackPanel>
      )}
      <Box>
        <Button
          size="sm"
          loading={saving}
          disabled={!changed || invalid || saving || failure === "unknown" || failure === "blocked"}
          onClick={() => void save()}
        >
          保存
        </Button>
      </Box>
    </Stack>
  )
}
