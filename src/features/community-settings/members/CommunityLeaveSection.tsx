"use client"

import { Box, Button, Group, Stack, Text } from "@mantine/core"
import { SectionHeader } from "@/components/SectionHeader"
import type { useCommunityMembersState, CommunityMembersActions } from "./useCommunityMembersState"

type MembersState = ReturnType<typeof useCommunityMembersState>

/** Leave Community entry and last-Administrator explanation. */
export function CommunityLeaveSection({
  state,
  onLeave,
}: { state: MembersState } & Pick<CommunityMembersActions, "onLeave">) {
  const { done, setOpened, blocked } = state
  return (
      <Box>
        <Box c="red">
          <SectionHeader>Communityから退会</SectionHeader>
        </Box>
        <Stack gap="sm">
          <Text size="sm">
            退会すると、このCommunityへのアクセスと、自分が管理するMediaのこのCommunityへの共有・分類が解除されます。アカウントやCommunity管理Mediaは削除されません。
          </Text>
          {done && (
            <Text size="sm" c="green">
              退会処理が完了しました。
            </Text>
          )}
          <Group>
            <Button
              color="red"
              variant="light"
              disabled={!onLeave || blocked || done}
              onClick={() => setOpened(true)}
            >
              Communityから退会する
            </Button>
          </Group>
          {blocked && (
            <Text size="sm" c="red">
              最後のAdministratorは退会できません。別の参加者をAdministratorに変更してから退会してください。
            </Text>
          )}
        </Stack>
      </Box>
  )
}
