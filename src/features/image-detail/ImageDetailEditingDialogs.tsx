"use client"

import { Button, Group, Modal, MultiSelect, Select, Stack, TagsInput, Text } from "@mantine/core"
import type { useImageDetailEditing } from "@/features/image-detail/useImageDetailEditing"

type Editing = ReturnType<typeof useImageDetailEditing>
type Props = Pick<Editing, "unshareTarget" | "setUnshareTarget" | "removeCommunityShare" | "detailEditor" | "setDetailEditor" | "detailValues" | "shareTarget" | "setShareTarget" | "addCommunityShare" | "detailDraft" | "setDetailDraft" | "saveDetailDraft">

/** Keep all edit/share dialogs with their existing visual and behavioral contract. */
export function ImageDetailEditingDialogs({
  unshareTarget,
  setUnshareTarget,
  removeCommunityShare,
  detailEditor,
  setDetailEditor,
  detailValues,
  shareTarget,
  setShareTarget,
  addCommunityShare,
  detailDraft,
  setDetailDraft,
  saveDetailDraft,
}: Props) {
  return (
    <>
      <Modal
        withCloseButton={false}
        opened={unshareTarget !== null}
        onClose={() => setUnshareTarget(null)}
        title="Communityの共有を解除"
        centered
        zIndex={410}
      >
        <Stack gap="md">
          <Text size="sm">
            {unshareTarget} への共有を解除しますか？
            このCommunityからMediaを閲覧できなくなります。他の共有先やMedia本体は削除されません。
          </Text>

          <Group justify="flex-end">
            <Button variant="default" onClick={() => setUnshareTarget(null)}>
              キャンセル
            </Button>
            <Button color="red" onClick={removeCommunityShare}>
              共有解除
            </Button>
          </Group>
        </Stack>
      </Modal>
      <Modal
        withCloseButton={false}
        opened={detailEditor === "communities"}
        onClose={() => setDetailEditor(null)}
        title="Communityへ共有"
        centered
        zIndex={400}
      >
        <Stack gap="md">
          <Text size="sm" c="dimmed">
            このMediaを共有するCommunityを1つ選択します。
          </Text>
          <Select
            label="共有先Community"
            searchable
            data={["Photo Club", "Family", "Travel"].filter(
              (name) => !detailValues.communities.includes(name),
            )}
            value={shareTarget}
            onChange={setShareTarget}
            placeholder="Communityを選択"
          />

          <Group justify="flex-end">
            <Button variant="default" onClick={() => setDetailEditor(null)}>
              キャンセル
            </Button>
            <Button disabled={!shareTarget} onClick={addCommunityShare}>
              共有する
            </Button>
          </Group>
        </Stack>
      </Modal>
      <Modal
        withCloseButton={false}
        opened={detailEditor === "tags"}
        onClose={() => setDetailEditor(null)}
        title="Tagsを編集"
        centered
        zIndex={400}
      >
        <Stack gap="md">
          <Text size="sm" c="dimmed">
            このMediaのTagを追加・除外できます。
          </Text>
          <TagsInput
            label="Tags"
            data={["旅行", "風景", "家族", "お気に入り"]}
            value={detailDraft}
            onChange={setDetailDraft}
          />

          <Group justify="flex-end">
            <Button variant="default" onClick={() => setDetailEditor(null)}>
              キャンセル
            </Button>
            <Button onClick={saveDetailDraft}>変更を反映</Button>
          </Group>
        </Stack>
      </Modal>
      <Modal
        withCloseButton={false}
        opened={detailEditor === "groups"}
        onClose={() => setDetailEditor(null)}
        title="Groupsを編集"
        centered
        zIndex={400}
      >
        <Stack gap="md">
          <Text size="sm" c="dimmed">
            現在の所属Groupを追加・除外できます。
          </Text>
          <MultiSelect
            label="Groups"
            searchable
            data={["旅行", "家族", "風景写真", "お気に入り"]}
            value={detailDraft}
            onChange={setDetailDraft}
          />

          <Group justify="flex-end">
            <Button variant="default" onClick={() => setDetailEditor(null)}>
              キャンセル
            </Button>
            <Button onClick={saveDetailDraft}>変更を反映</Button>
          </Group>
        </Stack>
      </Modal>
    </>
  )
}
