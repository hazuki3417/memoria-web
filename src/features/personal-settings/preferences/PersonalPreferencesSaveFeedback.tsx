"use client"

import { Button, Stack } from "@mantine/core"
import { FeedbackPanel } from "@/components/Feedback"
import type { useUserPreferences } from "./useUserPreferences"
type PreferencesModel = ReturnType<typeof useUserPreferences>

/** Owns the existing Preferences save error and explicit recovery presentation. */
export function PersonalPreferencesSaveFeedback({ model }: { model: PreferencesModel }) {
  const { saveError, blockedFeedback, validation, inspect, confirmObservation, retry, discard, inspected, observedMatches, hasSession, canRetry } = model
  return (
    <>
      {saveError && (
        <FeedbackPanel
          kind={saveError === "unknown" ? "warning" : "error"}
          title={
            saveError === "blocked"
              ? blockedFeedback?.title ?? "設定を変更できません"
              : saveError === "validation"
                ? "入力内容を確認してください"
                : saveError === "unknown"
                  ? "保存結果を確認できませんでした"
                  : "保存できませんでした"
          }
          role="alert"
          actions={
            saveError === "blocked" ? undefined : (
              <>
              {saveError === "unknown" && (
                <Button size="xs" variant="light" onClick={() => void inspect()}>
                  現在の状態を確認
                </Button>
              )}
              {saveError === "unknown" && observedMatches && (
                <Button size="xs" variant="light" onClick={confirmObservation}>
                  確認完了
                </Button>
              )}
              {((saveError === "retryable" || saveError === "validation") ||
                (saveError === "unknown" && inspected && !observedMatches)) && (
                <Button size="xs" disabled={!canRetry} onClick={retry}>
                  もう一度保存
                </Button>
              )}
              {hasSession && (
                <Button size="xs" variant="subtle" color="gray" onClick={discard}>
                  変更を破棄
                </Button>
              )}
              </>
            )
          }
        >
          <Stack gap="xs">
            {saveError === "validation" ? (
              <span>
                {validation?.formError
                  ? "入力した設定の一部を受け付けられませんでした。内容を確認してから、もう一度保存してください。"
                  : "入力項目のエラーを修正してから、もう一度保存してください。"}
              </span>
            ) : saveError === "blocked" ? (
              <span>{blockedFeedback?.description ?? "画面を再読み込みして現在の状態を確認してください。"}</span>
            ) : saveError === "unknown" ? (
              <span>
                変更内容は保持しています。現在の設定を確認してから、必要に応じて保存してください。
              </span>
            ) : (
              <span>
                変更内容を保持しています。内容を確認して再試行してください。
              </span>
            )}
            {saveError === "unknown" && inspected && (
              <span>
                {observedMatches
                  ? "現在の設定は入力した値と一致しています。ただし、先ほどの保存が成功したことを示すものではありません。"
                  : "現在の設定と入力した値が一致しません。"}
              </span>
            )}
          </Stack>
        </FeedbackPanel>
      )}
    </>
  )
}
