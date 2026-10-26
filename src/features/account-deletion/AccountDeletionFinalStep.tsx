import {
  Badge,
  Box,
  Button,
  Divider,
  Group,
  Stack,
  Text,
  Title,
} from "@mantine/core"
import { FeedbackAlert } from "@/components/Feedback"
import type { AccountDeletionController } from "./useAccountDeletionController"

export function AccountDeletionFinalStep({
  flow,
  prototype,
}: {
  flow: AccountDeletionController
  prototype: boolean
}) {
  const {
    compactStepper,
    decisions,
    reauth,
    setReauth,
    setGrant,
    busy,
    flowError,
    setConfirmed,
    mediaCount,
    communities,
    needsResolution,
    toDelete,
    cancel,
    next,
    back,
    startReauthentication,
    confirmDeletion,
  } = flow
  return (
    <Box w="100%">
      {!compactStepper && (
        <>
          <Title order={2} size="h4">
            最終確認
          </Title>
          <Divider my="md" />
        </>
      )}
      <Stack gap="lg">
        <Box>
          <Title order={3} size="h5">
            アカウントとMedia
          </Title>
          <Text size="sm">
            アカウントおよび管理Media {mediaCount}
            件を削除します。
          </Text>
        </Box>
        <Box>
          <Title order={3} size="h5">
            Communityへの対応
          </Title>
          {!needsResolution && (
            <FeedbackAlert
              kind="info"
              title="Communityの管理状態を変更する必要はありません"
            >
              {communities.length === 0
                ? "参加中のCommunityはありません。管理状態の解消と削除対象の確認は省略しました。"
                : "最後のAdministratorであるCommunityはありません。参加中のCommunityからはアカウント削除時に退会します。管理状態の解消と削除対象の確認は省略しました。"}
            </FeedbackAlert>
          )}
          {needsResolution && toDelete.length === 0 && (
            <FeedbackAlert kind="info" title="削除するCommunityはありません">
              削除対象の確認は、対象がないため省略しました。
            </FeedbackAlert>
          )}
          {communities.length > 0 && (
            <Stack
              gap={0}
              mt="sm"
              style={{
                border: "1px solid var(--mantine-color-default-border)",
                borderRadius: "var(--mantine-radius-md)",
                overflow: "hidden",
              }}
            >
              {communities.map((community, index) => {
                const action =
                  community.relation !== "last-administrator"
                    ? "leave"
                    : decisions[community.id]?.choice === "delete"
                      ? "delete"
                      : "keep"
                const successors = (decisions[community.id]?.successors ?? [])
                  .map(
                    (successor) =>
                      community.candidates.find(
                        (candidate) => candidate.value === successor,
                      )?.label,
                  )
                  .filter(Boolean)
                  .join("、")

                return (
                  <Group
                    key={community.id}
                    gap="md"
                    px="sm"
                    py="xs"
                    wrap="nowrap"
                    style={{
                      borderTop:
                        index > 0
                          ? "1px solid var(--mantine-color-default-border)"
                          : undefined,
                    }}
                  >
                    <Box style={{ flex: 1, minWidth: 0 }}>
                      <Text size="sm" fw={500} truncate>
                        {community.name}
                      </Text>
                      <Text size="xs" c="dimmed" truncate>
                        {action === "delete"
                          ? "Communityと管理Mediaを削除"
                          : action === "keep"
                            ? `Administrator → ${successors || "未指定"}`
                            : "Communityから退会・Communityは保持"}
                      </Text>
                    </Box>
                    <Badge
                      size="sm"
                      variant="light"
                      color={
                        action === "delete"
                          ? "red"
                          : action === "keep"
                            ? "green"
                            : "gray"
                      }
                    >
                      {action === "delete"
                        ? "削除"
                        : action === "keep"
                          ? "保持"
                          : "退会"}
                    </Badge>
                  </Group>
                )
              })}
            </Stack>
          )}
        </Box>
        <FeedbackAlert
          kind="error"
          title="アカウントと削除対象のデータは復元できません"
        >
          削除を続けるには再認証が必要です。
        </FeedbackAlert>
        {flowError && (
          <FeedbackAlert kind="error" title="処理を完了できませんでした">
            {flowError}
          </FeedbackAlert>
        )}
        {reauth && (
          <FeedbackAlert
            kind="info"
            title={prototype ? "再認証（プロトタイプ）" : "再認証済み"}
          >
            {prototype
              ? "実際のAuth0認証は行いません。削除処理も実行されません。"
              : "削除を確定する前に、内容をもう一度確認してください。"}
          </FeedbackAlert>
        )}
        <Group gap="sm" justify="space-between">
          <Box style={{ flex: 1 }}>
            <Button
              size="sm"
              variant="default"
              onClick={() => {
                setReauth(false)
                setGrant(null)
                back()
              }}
            >
              戻る
            </Button>
          </Box>
          <Box
            style={{
              flex: 1,
              display: "flex",
              justifyContent: "center",
            }}
          >
            <Button size="sm" variant="subtle" color="gray" onClick={cancel}>
              削除手続きを中止して設定に戻る
            </Button>
          </Box>
          <Box
            style={{
              flex: 1,
              display: "flex",
              justifyContent: "flex-end",
            }}
          >
            <Button
              size="sm"
              color={reauth ? "red" : undefined}
              loading={busy}
              onClick={() =>
                prototype
                  ? reauth
                    ? setConfirmed(true)
                    : next()
                  : reauth
                    ? void confirmDeletion()
                    : void startReauthentication()
              }
            >
              {reauth ? "アカウントを削除する" : "再認証する"}
            </Button>
          </Box>
        </Group>
      </Stack>
    </Box>
  )
}
