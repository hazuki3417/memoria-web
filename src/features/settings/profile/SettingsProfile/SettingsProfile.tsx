"use client"

import { Box, Button, Stack, TextInput } from "@mantine/core"
import { useEffect, useRef, useState } from "react"
import { useController, useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import type { z } from "zod"
import { profileSchema } from "../profileSchema"
import { getProfileBlockedFeedback, type ProfileBlockedFeedback } from "../profileBlockedFeedback"
import { FeedbackPanel, showNotification } from "@/components/Feedback"
import { PageHeader } from "@/components/PageHeader"
import { SectionHeader } from "@/components/SectionHeader"
import {
  classifySettingsSaveFailure,
  resolveSettingsFailureValidation,
} from "../../graphqlSettingsResult"

const MOCK_PROFILE = { nickname: "ユーザー" }

export type SaveProfile = (nickname: string) => Promise<void>
export type InspectProfile = () => Promise<string>

type Inspection =
  | { status: "idle" | "checking" | "failed" }
  | { status: "matches" | "differs"; nickname: string }

const DEFAULT_BLOCKED_MESSAGE =
  "現在の状態では保存を続けられません。ページを再読み込みして、プロフィールの状態を確認してください。"

export function SettingsProfile({
  onSave,
  onInspect,
  initialNickname = MOCK_PROFILE.nickname,
  initialSaveState = "idle",
  blockedMessage = DEFAULT_BLOCKED_MESSAGE,
}: {
  onSave: SaveProfile
  onInspect?: InspectProfile
  initialNickname?: string
  initialSaveState?: "idle" | "saving" | "retryable-error" | "blocked"
  blockedMessage?: string
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
        const result = resolveSettingsFailureValidation(error, ["nickname"])
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

  return (
    <Stack gap="xl">
      <PageHeader
        title="プロフィール"
        description="プロフィール情報を変更します。"
      />
      <Box>
        <SectionHeader>基本情報</SectionHeader>
        <Stack gap="md" maw={540}>
          {saveState === "retryable-error" && (
            <FeedbackPanel
              kind="error"
              title="プロフィールを保存できませんでした"
              role="alert"
            >
              入力した名前は保持しています。下の「再試行」ボタンからもう一度保存できます。
            </FeedbackPanel>
          )}
          {formInvalid && (
            <FeedbackPanel
              kind="error"
              title="入力内容を確認してください"
              role="alert"
            >
              入力した値を受け付けられませんでした。内容を見直して、もう一度保存してください。
              編集しただけでは問題が解消したとは限りません。
            </FeedbackPanel>
          )}
          {isUnknown && (
            <FeedbackPanel
              kind="warning"
              title="プロフィールの保存結果を確認できませんでした"
              role="alert"
              actions={
                <>
                  {onInspect && (
                    <Button
                      size="xs"
                      variant="light"
                      loading={inspection.status === "checking"}
                      onClick={() => void inspectCurrentProfile()}
                    >
                      {inspection.status === "idle" ||
                      inspection.status === "failed" ||
                      inspection.status === "checking"
                        ? "現在の状態を確認"
                        : "もう一度確認"}
                    </Button>
                  )}
                  {inspection.status === "matches" && (
                    <Button size="xs" onClick={confirmObservedProfile}>
                      確認完了
                    </Button>
                  )}
                  {inspection.status === "differs" && (
                    <>
                      <Button
                        size="xs"
                        disabled={!canRetryInspected}
                        onClick={() => void save()}
                      >
                        もう一度保存
                      </Button>
                      <Button
                        size="xs"
                        variant="subtle"
                        color="gray"
                        onClick={discardUnconfirmedDraft}
                      >
                        変更を破棄
                      </Button>
                    </>
                  )}
                </>
              }
            >
              <Stack gap="xs">
                <span>
                  入力した名前は保持しています。前の保存が成功したかは分からないため、自動で再送しません。
                </span>
                {inspection.status === "matches" && (
                  <span>
                    現在のプロフィールは入力内容と一致しています。元の保存処理が成功した証明ではありません。内容を確認した場合は「確認完了」を選んでください。
                  </span>
                )}
                {inspection.status === "differs" && (
                  <span>
                    現在のニックネームは「{inspection.nickname}」です。入力内容の「{normalized}」とは異なります。必要な場合だけ、もう一度保存するか、変更を破棄してください。
                  </span>
                )}
                {inspection.status === "failed" && (
                  <span>
                    現在のプロフィールを取得できませんでした。保存操作は再送せず、状態の確認をやり直してください。
                  </span>
                )}
                {!onInspect && (
                  <span>
                    この画面では現在の状態を照会できません。入力内容を控えてから画面を再読み込みしてください。
                  </span>
                )}
              </Stack>
            </FeedbackPanel>
          )}
          {isBlocked && (
            <FeedbackPanel
              kind="error"
              title={blockedFeedback?.title ?? "プロフィールを変更できません"}
              role="alert"
            >
              {blockedFeedback?.description ?? blockedMessage}
            </FeedbackPanel>
          )}
          <TextInput
            label="ニックネーム"
            description="Memoriaで表示する名前です。"
            name={field.name}
            ref={field.ref}
            onBlur={field.onBlur}
            value={field.value}
            onChange={(event) => {
              field.onChange(event)
              clearErrors("nickname")
              if (isUnknown) {
                inspectionGeneration.current += 1
                setInspection({ status: "idle" })
              }
              // A form-level server rejection remains visible until another
              // confirmed submit. Editing alone cannot prove it is resolved.
            }}
            error={
              fieldState.error?.type === "server"
                ? fieldState.error.message
                : showClientError && !validation.success
                  ? validation.error.issues[0]?.message
                  : undefined
            }
            required
            disabled={isSaving || isBlocked}
          />
          <Button
            size="sm"
            style={{ alignSelf: "flex-start" }}
            disabled={!dirty || invalid || isSaving || isBlocked || isUnknown}
            loading={isSaving}
            onClick={() => void save()}
          >
            {saveLabel}
          </Button>
        </Stack>
      </Box>
    </Stack>
  )
}
