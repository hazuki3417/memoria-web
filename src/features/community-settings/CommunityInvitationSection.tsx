"use client"
import { ActionIcon, Badge, Box, Button, Group, Modal, Stack, Text, TextInput } from "@mantine/core"
import { IconCopy } from "@tabler/icons-react"
import type { Dispatch, SetStateAction } from "react"
import { SectionHeader } from "@/components/SectionHeader"
export type CommunityInvitationSectionProps = { isAdmin: boolean; active: boolean; invitation: "none"|"active"|"expired"|"revoked"; invitationUrl: string; expiresAt: string; busy: boolean; issue: () => void; copyInvitation: () => Promise<void>; confirm: "reissue"|"revoke"|null; setConfirm: Dispatch<SetStateAction<"reissue"|"revoke"|null>>; changeInvitation: () => void }
export function CommunityInvitationSection({ isAdmin, active, invitation, invitationUrl, expiresAt, busy, issue, copyInvitation, confirm, setConfirm, changeInvitation }: CommunityInvitationSectionProps) {
  return (
    <>
      <Box>
        <SectionHeader>招待URL</SectionHeader>
        <Stack gap="md" maw={540}>
          <Box>
            <Badge variant="light">
              {active
                ? "有効"
                : invitation === "expired"
                  ? "期限切れ"
                  : invitation === "revoked"
                    ? "無効化済み"
                    : "未発行"}
            </Badge>
          </Box>
          <TextInput
            label="招待URL"
            value={active ? invitationUrl : "-"}
            readOnly
            rightSection={
              <ActionIcon
                variant="subtle"
                aria-label="招待URLをコピー"
                title="招待URLをコピー"
                disabled={!active}
                onClick={() => {
                  void copyInvitation()
                }}
              >
                <IconCopy size={16} />
              </ActionIcon>
            }
            rightSectionPointerEvents="all"
          />
          <Text size="sm" c="dimmed">
            有効期限: {active ? expiresAt : "----/--/-- --:--:--"}
          </Text>
          {isAdmin ? (
            <Group gap="sm">
              {!active ? (
                <Button size="sm" loading={busy} onClick={issue}>
                  招待URLを発行
                </Button>
              ) : (
                <>
                  <Button
                    size="sm"
                    variant="default"
                    onClick={() => setConfirm("reissue")}
                  >
                    再発行
                  </Button>
                  <Button
                    size="sm"
                    color="red"
                    variant="outline"
                    onClick={() => setConfirm("revoke")}
                  >
                    無効化
                  </Button>
                </>
              )}
            </Group>
          ) : (
            <Text size="sm" c="dimmed">
              招待URLの発行と管理はAdministratorのみ行えます。
            </Text>
          )}
        </Stack>
      </Box>

      <Modal
        opened={confirm !== null}
        onClose={() => setConfirm(null)}
        title={confirm === "reissue" ? "招待URLを再発行" : "招待URLを無効化"}
        centered
      >
        <Stack>
          <Text size="sm">
            現在の招待URLは利用できなくなります。共有済みのURLからも参加できなくなります。
          </Text>
          <Group justify="flex-end">
            <Button variant="default" onClick={() => setConfirm(null)}>
              キャンセル
            </Button>
            <Button
              color={confirm === "revoke" ? "red" : undefined}
              onClick={changeInvitation}
            >
              {confirm === "reissue" ? "再発行する" : "無効化する"}
            </Button>
          </Group>
        </Stack>
      </Modal>
    </>
  )
}
