"use client"

import { Box, Button, Stack, TextInput } from "@mantine/core"
import { FeedbackPanel } from "@/components/Feedback"
import { useCommunityAliasForm } from "./useCommunityAliasForm"

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
    field, fieldState, text, saving, failure, formInvalid, blockedFeedback,
    inspection, inspect, canResaveInspected, confirmObservation,
    discardUnconfirmed, normalized, validation, showClientError,
    changed, invalid, save, onAliasChange,
  } = useCommunityAliasForm({ savedAlias, onSave, onInspect })

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
        onChange={onAliasChange}
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
