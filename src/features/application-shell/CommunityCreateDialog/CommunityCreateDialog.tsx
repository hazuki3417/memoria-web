import { Button, Group, Modal, Stack, Text, TextInput } from "@mantine/core"

export type CommunityCreateDialogProps = {
  opened: boolean
  onClose: () => void
  name: string
  onNameChange: (value: string) => void
  error: string
  onErrorClear: () => void
  busy: boolean
  communitiesError: boolean
  onCreate: () => void
}

export function CommunityCreateDialog({
  opened,
  onClose,
  name,
  onNameChange,
  error,
  onErrorClear,
  busy,
  communitiesError,
  onCreate,
}: CommunityCreateDialogProps) {
  return (
    <Modal
            opened={opened}
            onClose={onClose}
            title="Communityを作成"
            centered
          >
            <Stack gap="md">
              <TextInput
                label="Community名"
                required
                autoFocus
                value={name}
                onChange={(event) => {
                  onNameChange(event.currentTarget.value)
                  onErrorClear()
                }}
                error={error || undefined}
                onKeyDown={(event) => {
                  if (event.key === "Enter") {
                    event.preventDefault()
                    onCreate()
                  }
                }}
              />
              <Text size="xs" c="dimmed">
                Communityを作成すると、メンバー管理と共有が利用できます。
              </Text>
              {communitiesError && (
                <Text size="xs" c="red">
                  Community一覧を取得できませんでした。再読み込みしてお試しください。
                </Text>
              )}
              <Group justify="flex-end">
                <Button
                  variant="default"
                  onClick={onClose}
                  disabled={busy}
                >
                  キャンセル
                </Button>
                <Button
                  disabled={!name.trim() || busy}
                  loading={busy}
                  onClick={() => onCreate()}
                >
                  Communityを作成
                </Button>
              </Group>
            </Stack>
          </Modal>
  )
}
