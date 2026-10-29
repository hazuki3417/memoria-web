import { Button, Text, TextInput, Stack } from "@mantine/core"
import { Modal } from "@/components/Modal"
import { ActionPanel } from "@/components/ActionPanel"

export type CommunityCreateModalProps = {
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

export function CommunityCreateModal({
  opened,
  onClose,
  name,
  onNameChange,
  error,
  onErrorClear,
  busy,
  communitiesError,
  onCreate,
}: CommunityCreateModalProps) {
  return (
    <Modal
            opened={opened}
            onClose={onClose}
            title="Communityを作成"
          >
            <Modal.Body>
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
      </Stack>
      </Modal.Body>
      <Modal.Divider />
      <Modal.Footer>
        <ActionPanel>
          <ActionPanel.End>

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
                        </ActionPanel.End>
        </ActionPanel>
      </Modal.Footer>
          </Modal>
  )
}
