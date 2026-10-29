"use client"

import {
  Button,
  Group,
  SimpleGrid,
  Stack,
  Text,
  TextInput,
} from "@mantine/core"
import {
  canEnterGroupName,
  countGroupNameGraphemes,
  validGroupName,
} from "../groupName"
import { RelationEditor } from "../RelationEditor"
import type { GroupRelationAvailability } from "../GroupBrowser"
import { Modal } from "@/components/Modal"
import { ActionPanel } from "@/components/ActionPanel"

export function GroupEditModal({
  opened,
  name,
  parents,
  children,
  candidates,
  currentGroupName,
  availability,
  canManage,
  detailsReady,
  conflictNeedsReview,
  saving,
  onNameChange,
  onParentsChange,
  onChildrenChange,
  onDelete,
  onClose,
  onSubmit,
}: {
  opened: boolean
  name: string
  parents: string[]
  children: string[]
  candidates: string[]
  currentGroupName: string
  availability?: GroupRelationAvailability
  canManage: boolean
  detailsReady: boolean
  conflictNeedsReview: boolean
  saving: boolean
  onNameChange: (value: string) => void
  onParentsChange: (value: string[]) => void
  onChildrenChange: (value: string[]) => void
  onDelete: () => void
  onClose: () => void
  onSubmit: () => Promise<void>
}) {
  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title="Groupを編集"
      size="lg"
      centered
      withCloseButton={false}
    >
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
        />
        <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="lg">
          <RelationEditor
            candidates={candidates}
            label="Parents"
            names={parents}
            oppositeNames={children}
            onChange={onParentsChange}
            currentGroupName={currentGroupName}
            availability={availability}
          />
          <RelationEditor
            candidates={candidates}
            label="Children"
            names={children}
            oppositeNames={parents}
            onChange={onChildrenChange}
            currentGroupName={currentGroupName}
            availability={availability}
          />
        </SimpleGrid>
        </Stack>
      </Modal.Body>
      <Modal.Divider />
      <Modal.Footer>
        <ActionPanel>
          <ActionPanel.Start>
            <Button variant="subtle" color="red" onClick={onDelete}>削除</Button>
          </ActionPanel.Start>
          <ActionPanel.Center>
            <Button variant="default" onClick={onClose}>キャンセル</Button>
          </ActionPanel.Center>
          <ActionPanel.End>
            <Button
              onClick={() => void onSubmit()}
              disabled={!canManage || !detailsReady || conflictNeedsReview || !validGroupName(name) || saving}
            >保存</Button>
          </ActionPanel.End>
        </ActionPanel>
      </Modal.Footer>
    </Modal>
  )
}
