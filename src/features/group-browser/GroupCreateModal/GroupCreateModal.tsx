"use client"

import {
  Button,
  SimpleGrid,
  Text,
  TextInput,
  Stack,
  Group,
} from "@mantine/core"
import { Modal } from "@/components/Modal"
import { ActionPanel } from "@/components/ActionPanel"
import {
  canEnterGroupName,
  countGroupNameGraphemes,
  validGroupName,
} from "../groupName"
import { RelationEditor } from "../RelationEditor"

export function GroupCreateModal({
  opened,
  name,
  parents,
  children,
  candidates,
  canManage,
  saving,
  onNameChange,
  onParentsChange,
  onChildrenChange,
  onClose,
  onSubmit,
}: {
  opened: boolean
  name: string
  parents: string[]
  children: string[]
  candidates: string[]
  canManage: boolean
  saving: boolean
  onNameChange: (value: string) => void
  onParentsChange: (value: string[]) => void
  onChildrenChange: (value: string[]) => void
  onClose: () => void
  onSubmit: () => void
}) {
  return (
    <Modal opened={opened} onClose={onClose} title="Groupを作成" size="lg">
      <Modal.Body>
        <Stack gap="lg">
          <TextInput
            label={
              <Group justify="space-between" wrap="nowrap">
                <Text component="span" size="sm" fw={500}>
                  名前
                </Text>
                <Text component="span" size="xs" c="dimmed">
                  {countGroupNameGraphemes(name)} / 100
                </Text>
              </Group>
            }
            value={name}
            onChange={(event) => {
              const value = event.currentTarget.value
              if (canEnterGroupName(value)) onNameChange(value)
            }}
            placeholder="Group名"
            styles={{ label: { display: "block", width: "100%" } }}
            required
          />
          <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="lg">
            <RelationEditor
              candidates={candidates}
              label="Parents"
              names={parents}
              oppositeNames={children}
              onChange={onParentsChange}
              currentGroupName={name.trim()}
            />
            <RelationEditor
              candidates={candidates}
              label="Children"
              names={children}
              oppositeNames={parents}
              onChange={onChildrenChange}
              currentGroupName={name.trim()}
            />
          </SimpleGrid>
        </Stack>
      </Modal.Body>
      <Modal.Divider />
      <Modal.Footer>
        <ActionPanel>
          <ActionPanel.End>
            <Button variant="default" onClick={onClose}>
              キャンセル
            </Button>
            <Button
              onClick={onSubmit}
              disabled={!canManage || !validGroupName(name) || saving}
            >
              作成
            </Button>
          </ActionPanel.End>
        </ActionPanel>
      </Modal.Footer>
    </Modal>
  )
}
