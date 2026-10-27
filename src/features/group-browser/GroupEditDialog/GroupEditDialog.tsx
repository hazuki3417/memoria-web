"use client"

import {
  Box,
  Button,
  Divider,
  Group,
  Modal,
  SimpleGrid,
  Stack,
  Text,
  TextInput,
} from "@mantine/core"
import {
  canEnterGroupName,
  countGroupNameGraphemes,
  validGroupName,
} from "./groupName"
import { RelationEditor } from "./RelationEditor"
import type { GroupRelationAvailability } from "./GroupBrowser"

export function GroupEditDialog({
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
        <Divider />
        <Box pos="relative">
          <Button variant="subtle" color="red" onClick={onDelete}>
            削除
          </Button>
          <Button
            variant="default"
            onClick={onClose}
            style={{
              position: "absolute",
              left: "50%",
              transform: "translateX(-50%)",
            }}
          >
            キャンセル
          </Button>
          <Button
            onClick={() => void onSubmit()}
            disabled={
              !canManage ||
              !detailsReady ||
              conflictNeedsReview ||
              !validGroupName(name) ||
              saving
            }
            style={{ position: "absolute", right: 0 }}
          >
            保存
          </Button>
        </Box>
      </Stack>
    </Modal>
  )
}
