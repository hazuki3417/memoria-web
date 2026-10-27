"use client"

import {
  ActionIcon,
  Badge,
  Box,
  Button,
  Group,
  Modal,
  Stack,
  Text,
  TextInput,
} from "@mantine/core"
import { IconCopy } from "@tabler/icons-react"
import type { Dispatch, SetStateAction } from "react"
import { PageHeader } from "@/components/PageHeader"
import { SectionHeader } from "@/components/SectionHeader"

type InvitationState = "none" | "active" | "expired" | "revoked"
type Confirmation = "reissue" | "revoke" | null

export type CommunityGeneralContentProps = {
  isAdmin: boolean
  communityId: string
  draft: string
  setDraft: Dispatch<SetStateAction<string>>
  invalid: boolean
  dirty: boolean
  savingName: boolean
  saveName: () => void
  active: boolean
  invitation: InvitationState
  invitationUrl: string
  expiresAt: string
  busy: boolean
  issue: () => void
  copyInvitation: () => Promise<void>
  confirm: Confirmation
  setConfirm: Dispatch<SetStateAction<Confirmation>>
  changeInvitation: () => void
}

export function CommunityGeneralContent({
  isAdmin,
  communityId,
  draft,
  setDraft,
  invalid,
  dirty,
  savingName,
  saveName,
  active,
  invitation,
  invitationUrl,
  expiresAt,
  busy,
  issue,
  copyInvitation,
  confirm,
  setConfirm,
  changeInvitation,
}: CommunityGeneralContentProps) {
  return (
    <Stack gap="xl">
      <PageHeader
        title="Community Settings"
        description="Communityの基本情報と管理"
      />

      <Box>
        <SectionHeader>基本情報</SectionHeader>
        <Stack gap="md" maw={540}>
          <TextInput
            label="Community名"
            value={draft}
            onChange={(event) => setDraft(event.currentTarget.value)}
            error={invalid ? "Community名を入力してください" : undefined}
            disabled={!isAdmin}
            required
          />
          {isAdmin && (
            <Box>
              <Button
                size="sm"
                disabled={!dirty || invalid || savingName}
                loading={savingName}
                onClick={saveName}
              >
                保存
              </Button>
            </Box>
          )}
        </Stack>
      </Box>

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

      {isAdmin && (
        <Box>
          <Box c="red">
            <SectionHeader>Community削除</SectionHeader>
          </Box>
          <Stack gap="md" maw={620}>
            <Text size="sm">
              Communityの削除は元に戻せません。Community管理Mediaも削除対象になります。
            </Text>
            <Box>
              <Button
                color="red"
                variant="default"
                size="sm"
                component="a"
                href={`/communities/${encodeURIComponent(communityId)}/settings/delete`}
              >
                Communityを削除する
              </Button>
            </Box>
          </Stack>
        </Box>
      )}

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
    </Stack>
  )
}
