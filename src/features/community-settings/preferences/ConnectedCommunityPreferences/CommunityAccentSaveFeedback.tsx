"use client"

import { Button, Stack, Text } from "@mantine/core"
import { FeedbackPanel } from "@/components/Feedback"
import type { useCommunityPreferencesConnection } from "./useCommunityPreferencesConnection"

type Connection = ReturnType<typeof useCommunityPreferencesConnection>

/** Renders the existing Accent save failure and explicit recovery controls. */
export function CommunityAccentSaveFeedback({
  communityId,
  snapshot,
  controller,
  canResave,
}: {
  communityId: string
  snapshot: Connection["snapshot"]
  controller: Connection["controller"]
  canResave: boolean
}) {
  const failure = snapshot.failure
  return (
    <FeedbackPanel
      kind={failure === "unknown" ? "warning" : "error"}
      role="alert"
      title={
        failure === "unknown"
          ? "保存結果を確認できませんでした"
          : failure === "blocked"
            ? snapshot.blockedFeedback?.title ?? "Community設定を変更できません"
            : snapshot.validation
              ? "入力内容を確認してください"
              : "保存できませんでした"
      }
      actions={
        failure === "blocked" ? undefined : (
          <>
          {failure === "unknown" && (
            <Button
              size="xs"
              variant="light"
              onClick={() => void controller.inspect(communityId)}
            >
              現在の状態を確認
            </Button>
          )}
          {failure === "unknown" && snapshot.observedMatches && (
            <Button
              size="xs"
              variant="light"
              onClick={() => controller.confirmObservation(communityId)}
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
                onClick={() => controller.retry(communityId)}
              >
                もう一度保存
              </Button>
            )}
          <Button
            size="xs"
            variant="subtle"
            color="gray"
            onClick={() => controller.discard(communityId)}
          >
            変更を破棄
          </Button>
          </>
        )
      }
    >
      <Stack gap="xs">
        <Text size="sm">
          画面の色は最後に保存を確認できた状態に戻しています。入力した色は保持しています。
          {failure === "unknown"
            ? " 現在の設定を確認してから、必要なら保存してください。"
            : failure === "blocked"
              ? ` ${snapshot.blockedFeedback?.description ?? "ログイン状態や権限を確認し、画面を再読み込みしてください。"}`
              : snapshot.validation
                ? " 入力項目を修正したうえで再保存するか、変更を破棄してください。"
                : " 内容を確認して、再保存するか変更を破棄してください。"}
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
