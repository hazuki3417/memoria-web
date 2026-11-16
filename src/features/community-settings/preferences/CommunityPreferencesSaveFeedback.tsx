"use client"

import { Button, Stack, Text } from "@mantine/core"
import { FeedbackPanel } from "@/components/Feedback"
import type { useCommunityPreferencesForm } from "./useCommunityPreferencesForm"

/** Preferencesの保存失敗と明示Recoveryの操作を表示する。 */
export const CommunityPreferencesSaveFeedback = ({
  model,
}: {
  model: ReturnType<typeof useCommunityPreferencesForm>
}) => {
  const { snapshot, canResave, inspect, confirmObservation, retry, discard } = model
  const failure = snapshot.failure
  if (!failure) return null
  let title = "保存できませんでした"
  let description = " 内容を確認して、再保存するか変更を破棄してください。"
  if (failure === "unknown") {
    title = "保存結果を確認できませんでした"
    description = " 現在の設定を確認してから、必要なら保存してください。"
  } else if (failure === "blocked") {
    title = snapshot.blockedFeedback?.title ?? "Community設定を変更できません"
    description = ` ${snapshot.blockedFeedback?.description ?? "ログイン状態や権限を確認し、画面を再読み込みしてください。"}`
  } else if (snapshot.validation) {
    title = "入力内容を確認してください"
    description = " 入力項目を修正したうえで再保存するか、変更を破棄してください。"
  }
  return (
    <FeedbackPanel
      kind={failure === "unknown" ? "warning" : "error"}
      role="alert"
      title={title}
      actions={
        failure === "blocked" ? undefined : (
          <>
          {failure === "unknown" && (
            <Button
              size="xs"
              variant="light"
              onClick={() => void inspect()}
            >
              現在の状態を確認
            </Button>
          )}
          {failure === "unknown" && snapshot.observedMatches && (
            <Button
              size="xs"
              variant="light"
              onClick={() => confirmObservation()}
            >
              確認完了
            </Button>
          )}
          {(failure === "rejected" ||
            (failure === "unknown" && snapshot.inspected)) &&
            !snapshot.observedMatches && (
              <Button
                size="xs"
                disabled={!canResave}
                onClick={() => retry()}
              >
                もう一度保存
              </Button>
            )}
          <Button
            size="xs"
            variant="subtle"
            color="gray"
            onClick={() => discard()}
          >
            変更を破棄
          </Button>
          </>
        )
      }
    >
      <Stack gap="xs">
        <Text size="sm">
          選択した色は保存が確定していなくても表示を維持しています。入力した色は保持しています。
          {description}
        </Text>
        {failure === "unknown" && snapshot.inspected && (
          <Text size="sm">
            {snapshot.observedMatches
              ? "現在の色は入力した色と一致しています。ただし、先ほどの保存が成功したことを示すものではありません。"
              : "現在の色と入力した色が一致しません。"}
          </Text>
        )}
      </Stack>
    </FeedbackPanel>
  )
}
