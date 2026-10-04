"use client"

import {
  Badge,
  Box,
  Button,
  Checkbox,
  Divider,
  Group,
  Modal,
  Paper,
  Popover,
  Stack,
  TagsInput,
  Text,
  TextInput,
  ThemeIcon,
} from "@mantine/core"
import { useMediaQuery } from "@mantine/hooks"
import {
  IconAlertCircle,
  IconCheck,
  IconClock,
  IconCloudUpload,
  IconHelpCircle,
  IconPhoto,
  IconPhotoPlus,
  IconRefresh,
  IconTrash,
} from "@tabler/icons-react"
import { useState } from "react"
import { ApplicationShell } from "@/components/ApplicationShell"
import { FeedbackAlert } from "@/components/Feedback"

export type UploadScenario =
  | "empty"
  | "ready"
  | "validation-errors"
  | "uploading"
  | "partial-failure"
  | "all-failed"
  | "non-retryable-failure"
  | "result-unknown"
  | "processing"
  | "completed"
  | "processing-failure"
  | "leave-confirmation"
  | "leave-uploading-confirmation"

type FileStatus =
  | "ready"
  | "validation-error"
  | "uploading"
  | "upload-failed"
  | "upload-rejected"
  | "result-unknown"
  | "processing"
  | "completed"
  | "processing-failed"

type UploadFile = {
  id: string
  name: string
  size: string
  status: FileStatus
  reason?: string
  tags: string[]
}

const fixtures: Record<
  Exclude<
    UploadScenario,
    "empty" | "leave-confirmation" | "leave-uploading-confirmation"
  >,
  UploadFile[]
> = {
  ready: [
    {
      id: "1",
      name: "IMG_1842.HEIC",
      size: "8.4 MB",
      status: "ready",
      tags: ["旅行"],
    },
    {
      id: "2",
      name: "IMG_1843.HEIC",
      size: "7.9 MB",
      status: "ready",
      tags: ["旅行"],
    },
    { id: "3", name: "sunset.webp", size: "3.1 MB", status: "ready", tags: [] },
  ],
  "validation-errors": [
    {
      id: "1",
      name: "IMG_1842.HEIC",
      size: "8.4 MB",
      status: "ready",
      tags: ["旅行"],
    },
    {
      id: "2",
      name: "panorama.png",
      size: "142.6 MB",
      status: "validation-error",
      reason: "ファイルサイズが128 MiBを超えています",
      tags: [],
    },
    {
      id: "3",
      name: "document.gif",
      size: "2.2 MB",
      status: "validation-error",
      reason: "対応していない画像形式です",
      tags: [],
    },
    { id: "4", name: "sunset.webp", size: "3.1 MB", status: "ready", tags: [] },
  ],
  uploading: [
    {
      id: "1",
      name: "IMG_1842.HEIC",
      size: "8.4 MB",
      status: "uploading",
      tags: ["旅行"],
    },
    {
      id: "2",
      name: "IMG_1843.HEIC",
      size: "7.9 MB",
      status: "processing",
      tags: ["旅行"],
    },
    { id: "3", name: "sunset.webp", size: "3.1 MB", status: "ready", tags: [] },
  ],
  "partial-failure": [
    {
      id: "1",
      name: "IMG_1842.HEIC",
      size: "8.4 MB",
      status: "completed",
      tags: ["旅行"],
    },
    {
      id: "2",
      name: "IMG_1843.HEIC",
      size: "7.9 MB",
      status: "upload-failed",
      reason: "通信状態を確認して再試行してください",
      tags: ["旅行"],
    },
    {
      id: "3",
      name: "sunset.webp",
      size: "3.1 MB",
      status: "processing",
      tags: [],
    },
  ],
  "all-failed": [
    {
      id: "1",
      name: "IMG_1842.HEIC",
      size: "8.4 MB",
      status: "upload-failed",
      reason: "通信状態を確認して再試行してください",
      tags: ["旅行"],
    },
    {
      id: "2",
      name: "IMG_1843.HEIC",
      size: "7.9 MB",
      status: "upload-failed",
      reason: "通信状態を確認して再試行してください",
      tags: ["旅行"],
    },
  ],
  "non-retryable-failure": [
    {
      id: "1",
      name: "IMG_1842.HEIC",
      size: "8.4 MB",
      status: "upload-rejected",
      reason: "このMediaをアップロードする権限がありません",
      tags: ["旅行"],
    },
    { id: "2", name: "sunset.webp", size: "3.1 MB", status: "ready", tags: [] },
  ],
  "result-unknown": [
    {
      id: "1",
      name: "IMG_1842.HEIC",
      size: "8.4 MB",
      status: "result-unknown",
      reason: "送信結果を確認しています。確認が終わるまで再送信しません",
      tags: ["旅行"],
    },
    { id: "2", name: "sunset.webp", size: "3.1 MB", status: "ready", tags: [] },
  ],
  processing: [
    {
      id: "1",
      name: "IMG_1842.HEIC",
      size: "8.4 MB",
      status: "completed",
      tags: ["旅行"],
    },
    {
      id: "2",
      name: "IMG_1843.HEIC",
      size: "7.9 MB",
      status: "processing",
      tags: ["旅行"],
    },
    {
      id: "3",
      name: "sunset.webp",
      size: "3.1 MB",
      status: "processing",
      tags: [],
    },
  ],
  completed: [
    {
      id: "1",
      name: "IMG_1842.HEIC",
      size: "8.4 MB",
      status: "completed",
      tags: ["旅行"],
    },
    {
      id: "2",
      name: "IMG_1843.HEIC",
      size: "7.9 MB",
      status: "completed",
      tags: ["旅行"],
    },
    {
      id: "3",
      name: "sunset.webp",
      size: "3.1 MB",
      status: "completed",
      tags: [],
    },
  ],
  "processing-failure": [
    {
      id: "1",
      name: "IMG_1842.HEIC",
      size: "8.4 MB",
      status: "completed",
      tags: ["旅行"],
    },
    {
      id: "2",
      name: "IMG_1843.HEIC",
      size: "7.9 MB",
      status: "processing-failed",
      reason: "Mediaは登録されていますが、表示用画像を生成できませんでした",
      tags: ["旅行"],
    },
    {
      id: "3",
      name: "sunset.webp",
      size: "3.1 MB",
      status: "completed",
      tags: [],
    },
  ],
}

const statusPresentation: Record<
  FileStatus,
  { label: string; color: string; icon: typeof IconCheck }
> = {
  ready: { label: "準備完了", color: "gray", icon: IconClock },
  "validation-error": {
    label: "アップロード不可",
    color: "red",
    icon: IconAlertCircle,
  },
  uploading: { label: "アップロード中", color: "blue", icon: IconCloudUpload },
  "upload-failed": {
    label: "アップロード失敗",
    color: "red",
    icon: IconAlertCircle,
  },
  "upload-rejected": {
    label: "アップロード不可",
    color: "red",
    icon: IconAlertCircle,
  },
  "result-unknown": {
    label: "結果を確認中",
    color: "yellow",
    icon: IconHelpCircle,
  },
  processing: { label: "画像処理中", color: "blue", icon: IconClock },
  completed: { label: "完了", color: "green", icon: IconCheck },
  "processing-failed": {
    label: "画像処理失敗",
    color: "red",
    icon: IconAlertCircle,
  },
}

const contexts = {
  personal: {
    id: "personal",
    kind: "personal" as const,
    label: "Personal",
    accentColor: "var(--mantine-color-blue-6)",
  },
  community: {
    id: "community",
    kind: "community" as const,
    label: "家族のアルバム",
    accentColor: "var(--mantine-color-teal-6)",
  },
}

const selectableStatuses: FileStatus[] = ["ready", "upload-failed"]
const removableStatuses: FileStatus[] = [
  "ready",
  "validation-error",
  "upload-failed",
  "upload-rejected",
]

export function MediaUploadPrototype({
  scenario = "ready",
  context = "personal",
}: {
  scenario?: UploadScenario
  context?: "personal" | "community"
}) {
  const compact = useMediaQuery("(max-width: 48em)")
  const initialFiles =
    scenario === "empty"
      ? []
      : scenario === "leave-confirmation"
        ? fixtures.ready
        : scenario === "leave-uploading-confirmation"
          ? fixtures.uploading
          : fixtures[scenario]
  const [files, setFiles] = useState<UploadFile[]>(initialFiles)
  const [selectedIds, setSelectedIds] = useState<string[]>(
    initialFiles
      .filter((file) => selectableStatuses.includes(file.status))
      .map((file) => file.id),
  )
  const [bulkTag, setBulkTag] = useState("")
  const currentContext = contexts[context]

  const selectableFiles = files.filter((file) =>
    selectableStatuses.includes(file.status),
  )
  const selectedFiles = selectableFiles.filter((file) =>
    selectedIds.includes(file.id),
  )
  const activeUpload = files.some((file) => file.status === "uploading")
  const registeredCount = files.filter((file) =>
    ["processing", "completed", "processing-failed"].includes(file.status),
  ).length
  const completedCount = files.filter(
    (file) => file.status === "completed",
  ).length
  const processingCount = files.filter(
    (file) => file.status === "processing",
  ).length
  const failedCount = files.filter(
    (file) => file.status === "upload-failed",
  ).length
  const invalidCount = files.filter(
    (file) => file.status === "validation-error",
  ).length
  const unknownCount = files.filter(
    (file) => file.status === "result-unknown",
  ).length
  const allSelectableChecked =
    selectableFiles.length > 0 &&
    selectedFiles.length === selectableFiles.length

  const toggleAll = () =>
    setSelectedIds(
      allSelectableChecked ? [] : selectableFiles.map((file) => file.id),
    )
  const toggleFile = (id: string, checked: boolean) =>
    setSelectedIds((current) =>
      checked
        ? [...new Set([...current, id])]
        : current.filter((item) => item !== id),
    )

  const applyTagAction = (action: "add" | "remove" | "replace") => {
    const tag = bulkTag.trim()
    if (!tag || selectedIds.length === 0) return
    setFiles((current) =>
      current.map((file) => {
        if (!selectedIds.includes(file.id)) return file
        if (action === "replace") return { ...file, tags: [tag] }
        if (action === "remove")
          return { ...file, tags: file.tags.filter((item) => item !== tag) }
        return {
          ...file,
          tags: file.tags.includes(tag) ? file.tags : [...file.tags, tag],
        }
      }),
    )
    setBulkTag("")
  }

  const removeFile = (id: string) => {
    setFiles((current) => current.filter((file) => file.id !== id))
    setSelectedIds((current) => current.filter((item) => item !== id))
  }
  const removeAll = () => {
    setFiles((current) =>
      current.filter((file) => !removableStatuses.includes(file.status)),
    )
    setSelectedIds((current) =>
      current.filter((id) => {
        const file = files.find((item) => item.id === id)
        return file ? !removableStatuses.includes(file.status) : false
      }),
    )
  }
  const updateTags = (id: string, tags: string[]) =>
    setFiles((current) =>
      current.map((file) => (file.id === id ? { ...file, tags } : file)),
    )

  return (
    <ApplicationShell
      currentContext={currentContext}
      contexts={Object.values(contexts)}
      navigationItems={[
        { id: "media", label: "メディア", icon: IconPhoto, active: true },
      ]}
      user={{ displayName: "ユーザー" }}
      onSelectContext={() => undefined}
      onSelectNavigation={() => undefined}
      onOpenSettings={() => undefined}
      onLogout={() => undefined}
    >
      <Box maw={1120} mx="auto" w="100%" pb={88}>
        <Stack gap="lg">
          <Paper
            withBorder
            radius="md"
            p={files.length === 0 ? "xl" : "md"}
            style={{ borderStyle: "dashed" }}
          >
            <Stack align="center" gap="sm" py={files.length === 0 ? 36 : 4}>
              <ThemeIcon
                variant="light"
                size={files.length === 0 ? 52 : 36}
                radius="xl"
              >
                <IconPhotoPlus size={files.length === 0 ? 28 : 20} />
              </ThemeIcon>
              <Box ta="center">
                <Text fw={600}>
                  {files.length === 0
                    ? "画像をここにドロップ"
                    : "画像をさらに追加"}
                </Text>
                <Text size="sm" c="dimmed" mt={2}>
                  JPEG / PNG / WebP / HEIC・HEIF ・ 最大100件 ・ 1件128 MiBまで
                </Text>
              </Box>
              <Button variant="default" size="sm">
                ファイルを選択
              </Button>
            </Stack>
          </Paper>

          {
            <>
              {invalidCount > 0 && (
                <FeedbackAlert
                  kind="warning"
                  title="アップロードできないファイルがあります"
                >
                  問題のあるファイルは選択できません。修正または削除してからアップロードしてください。
                </FeedbackAlert>
              )}
              {failedCount > 0 && (
                <FeedbackAlert
                  kind="warning"
                  title={
                    failedCount === files.length
                      ? "アップロードに失敗しました"
                      : "一部のアップロードに失敗しました"
                  }
                >
                  成功済みのMediaは保持されています。再試行できるファイルだけを選択して送信できます。
                </FeedbackAlert>
              )}
              {unknownCount > 0 && (
                <FeedbackAlert
                  kind="warning"
                  title="送信結果を確認しているMediaがあります"
                >
                  結果が確定するまで再送信しません。重複登録を防ぐため、このMediaは選択できません。
                </FeedbackAlert>
              )}
              {scenario === "processing-failure" && (
                <FeedbackAlert
                  kind="error"
                  title="画像処理に失敗したMediaがあります"
                >
                  Media登録は完了しています。再アップロードせず、Media
                  Browserで状態を確認できます。
                </FeedbackAlert>
              )}
              {scenario === "completed" && (
                <FeedbackAlert
                  kind="success"
                  title="アップロードが完了しました"
                >
                  すべての画像をMediaとして利用できます。
                </FeedbackAlert>
              )}

              <Stack gap="sm">
                <Paper withBorder radius="md" p="sm">
                  {compact ? (
                    <Stack gap="sm">
                      <Group justify="space-between" wrap="nowrap">
                        <Group gap="sm" wrap="nowrap">
                          <Checkbox
                            checked={allSelectableChecked}
                            indeterminate={
                              selectedFiles.length > 0 && !allSelectableChecked
                            }
                            onChange={toggleAll}
                            disabled={selectableFiles.length === 0}
                            aria-label="アップロード可能なMediaをすべて選択"
                          />
                          <Text size="sm" fw={600}>
                            {selectedFiles.length}件選択
                          </Text>
                        </Group>
                        <Button
                          variant="subtle"
                          color="gray"
                          size="compact-sm"
                          onClick={removeAll}
                          disabled={
                            !files.some((file) =>
                              removableStatuses.includes(file.status),
                            )
                          }
                          aria-label="すべて削除"
                        >
                          <IconTrash size={16} />
                        </Button>
                      </Group>
                      <Group gap="lg">
                        <Stack gap={0}>
                          <Text size="xs" c="dimmed">
                            Media登録済み
                          </Text>
                          <Text size="xs" c="dimmed">
                            画像処理中
                          </Text>
                          <Text size="xs" c="dimmed">
                            完了
                          </Text>
                        </Stack>
                        <Stack gap={0}>
                          <Text size="xs" c="dimmed">
                            {registeredCount}件
                          </Text>
                          <Text size="xs" c="dimmed">
                            {processingCount}件
                          </Text>
                          <Text size="xs" c="dimmed">
                            {completedCount}件
                          </Text>
                        </Stack>
                      </Group>
                      <TextInput
                        value={bulkTag}
                        onChange={(event) =>
                          setBulkTag(event.currentTarget.value)
                        }
                        disabled={
                          files.length > 0 && selectableFiles.length === 0
                        }
                        placeholder={
                          files.length === 0
                            ? "追加するMediaの共通Tag"
                            : "選択したMediaのTag"
                        }
                      />
                    </Stack>
                  ) : (
                    <Group align="center" wrap="nowrap" gap="md">
                      <Checkbox
                        checked={allSelectableChecked}
                        indeterminate={
                          selectedFiles.length > 0 && !allSelectableChecked
                        }
                        onChange={toggleAll}
                        disabled={selectableFiles.length === 0}
                        aria-label="アップロード可能なMediaをすべて選択"
                      />
                      <Box w={72} style={{ flex: "0 0 72px" }}>
                        <Text size="sm" fw={600}>
                          {selectedFiles.length}件選択
                        </Text>
                      </Box>
                      <Divider orientation="vertical" />
                      <Stack gap={0} style={{ flex: "0 0 22%", minWidth: 180 }}>
                        <Group gap="xs" wrap="nowrap">
                          <Text size="xs" c="dimmed" w={88}>
                            Media登録済み
                          </Text>
                          <Text size="xs" c="dimmed">
                            {registeredCount}件
                          </Text>
                        </Group>
                        <Group gap="xs" wrap="nowrap">
                          <Text size="xs" c="dimmed" w={88}>
                            画像処理中
                          </Text>
                          <Text size="xs" c="dimmed">
                            {processingCount}件
                          </Text>
                        </Group>
                        <Group gap="xs" wrap="nowrap">
                          <Text size="xs" c="dimmed" w={88}>
                            完了
                          </Text>
                          <Text size="xs" c="dimmed">
                            {completedCount}件
                          </Text>
                        </Group>
                      </Stack>
                      <Divider orientation="vertical" />
                      <TextInput
                        style={{ flex: 1 }}
                        value={bulkTag}
                        onChange={(event) =>
                          setBulkTag(event.currentTarget.value)
                        }
                        disabled={
                          files.length > 0 && selectableFiles.length === 0
                        }
                        placeholder={
                          files.length === 0
                            ? "追加するMediaの共通Tag"
                            : "選択したMediaのTag"
                        }
                      />
                      <Box w={36} style={{ flex: "0 0 36px" }}>
                        <Button
                          variant="subtle"
                          color="gray"
                          size="compact-sm"
                          onClick={removeAll}
                          disabled={
                            !files.some((file) =>
                              removableStatuses.includes(file.status),
                            )
                          }
                          aria-label="すべて削除"
                        >
                          <IconTrash size={16} />
                        </Button>
                      </Box>
                    </Group>
                  )}
                </Paper>
                <Group justify="center" gap="xs">
                  <Button
                    variant="default"
                    size="sm"
                    disabled={
                      files.length === 0 ||
                      !bulkTag.trim() ||
                      selectedFiles.length === 0
                    }
                    onClick={() => applyTagAction("add")}
                  >
                    追加
                  </Button>
                  <Button
                    variant="default"
                    size="sm"
                    disabled={
                      files.length === 0 ||
                      !bulkTag.trim() ||
                      selectedFiles.length === 0
                    }
                    onClick={() => applyTagAction("remove")}
                  >
                    除去
                  </Button>
                  <Button
                    variant="default"
                    size="sm"
                    disabled={
                      files.length === 0 ||
                      !bulkTag.trim() ||
                      selectedFiles.length === 0
                    }
                    onClick={() => applyTagAction("replace")}
                  >
                    置換
                  </Button>
                </Group>

                {files.length > 0 && (
                  <Paper withBorder radius="md" style={{ overflow: "hidden" }}>
                    <Box>
                      {files.map((file, index) => (
                        <Box key={file.id}>
                          {index > 0 && <Divider />}
                          <FileRow
                            file={file}
                            compact={compact}
                            selected={selectedIds.includes(file.id)}
                            selectable={selectableStatuses.includes(
                              file.status,
                            )}
                            onSelect={(checked) => toggleFile(file.id, checked)}
                            onRemove={() => removeFile(file.id)}
                            onTagsChange={(tags) => updateTags(file.id, tags)}
                          />
                        </Box>
                      ))}
                    </Box>
                  </Paper>
                )}
              </Stack>
            </>
          }
        </Stack>
      </Box>

      <Box
        style={{
          position: "fixed",
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: 100,
          borderTop: "1px solid var(--mantine-color-default-border)",
          background: "var(--mantine-color-body)",
        }}
      >
        <Box maw={1120} mx="auto" px="lg" py="sm">
          <Group justify="flex-end" wrap="nowrap">
            <Text size="sm" c="dimmed">
              {selectedFiles.length}件選択中
            </Text>
            {registeredCount > 0 &&
            selectedFiles.length === 0 &&
            !activeUpload ? (
              <Button variant="default">Media Browserへ戻る</Button>
            ) : (
              <Button disabled={activeUpload || selectedFiles.length === 0}>
                {activeUpload ? "アップロード中" : "アップロード"}
              </Button>
            )}
          </Group>
        </Box>
      </Box>

      <Modal
        opened={
          scenario === "leave-confirmation" ||
          scenario === "leave-uploading-confirmation"
        }
        onClose={() => undefined}
        title="アップロード画面を離れますか？"
        centered
      >
        <Stack>
          <Text size="sm">
            {scenario === "leave-uploading-confirmation"
              ? "アップロード中または待機中の画像があります。この画面を離れると未完了の送信が中断される可能性があります。すでに登録されたMediaは削除されません。"
              : "まだアップロードしていない画像があります。この画面を離れると、未送信の画像と編集内容は失われます。"}
          </Text>
          <Group justify="flex-end">
            <Button variant="default">この画面に残る</Button>
            <Button color="red">移動する</Button>
          </Group>
        </Stack>
      </Modal>
    </ApplicationShell>
  )
}

function FileRow({
  file,
  compact,
  selected,
  selectable,
  onSelect,
  onRemove,
  onTagsChange,
}: {
  file: UploadFile
  compact: boolean
  selected: boolean
  selectable: boolean
  onSelect: (checked: boolean) => void
  onRemove: () => void
  onTagsChange: (tags: string[]) => void
}) {
  const presentation = statusPresentation[file.status]
  const StatusIcon = presentation.icon
  const removable = removableStatuses.includes(file.status)
  const tagEditable = ["ready", "upload-failed"].includes(file.status)

  if (compact) {
    return (
      <Box p="sm">
        <Group align="center" wrap="nowrap" h={72}>
          <Checkbox
            checked={selected}
            disabled={!selectable}
            onChange={(e) => onSelect(e.currentTarget.checked)}
            aria-label={`${file.name}を選択`}
          />
          <Box
            w={72}
            h={72}
            style={{
              flex: "0 0 auto",
              borderRadius: "var(--mantine-radius-sm)",
              background: "var(--mantine-color-default-hover)",
              display: "grid",
              placeItems: "center",
              overflow: "hidden",
            }}
          >
            <IconPhoto size={22} stroke={1.4} />
          </Box>
          <Stack
            gap={4}
            justify="center"
            h={72}
            style={{ flex: "0 0 28%", minWidth: 0, overflow: "hidden" }}
          >
            <Box style={{ minWidth: 0 }}>
              <Text size="sm" fw={600} truncate>
                {file.name}
              </Text>
              <Text size="xs" c="dimmed">
                {file.size}
              </Text>
            </Box>
            <StatusBadge
              file={file}
              presentation={presentation}
              StatusIcon={StatusIcon}
            />
          </Stack>
          <Box h={72} style={{ flex: 1, minWidth: 0 }}>
            <TagsInput
              value={file.tags}
              onChange={onTagsChange}
              disabled={!tagEditable}
              size="xs"
              placeholder="Tagを追加"
              styles={{
                root: { height: "100%" },
                wrapper: { height: "100%" },
                input: {
                  minHeight: "72px",
                  height: "72px",
                  alignContent: "flex-start",
                  paddingTop: "8px",
                  paddingBottom: "8px",
                },
              }}
            />
          </Box>
          <Box w={28} style={{ flex: "0 0 28px" }}>
            <Button
              variant="subtle"
              color="gray"
              size="compact-sm"
              disabled={!removable}
              onClick={onRemove}
              aria-label={`${file.name}を削除`}
            >
              <IconTrash size={16} />
            </Button>
          </Box>
        </Group>
      </Box>
    )
  }

  return (
    <Box p="sm">
      <Group align="center" wrap="nowrap" gap="md" h={72}>
        <Checkbox
          checked={selected}
          disabled={!selectable}
          onChange={(e) => onSelect(e.currentTarget.checked)}
          aria-label={`${file.name}を選択`}
        />
        <Group
          align="center"
          wrap="nowrap"
          gap="sm"
          h={72}
          style={{ flex: "0 0 36%", minWidth: 0, overflow: "hidden" }}
        >
          <Box
            w={72}
            h={72}
            style={{
              flex: "0 0 auto",
              borderRadius: "var(--mantine-radius-sm)",
              background: "var(--mantine-color-default-hover)",
              display: "grid",
              placeItems: "center",
              overflow: "hidden",
            }}
          >
            <IconPhoto size={28} stroke={1.4} />
          </Box>
          <Stack
            gap={4}
            justify="center"
            h={72}
            style={{ flex: 1, minWidth: 0, overflow: "hidden" }}
          >
            <Box style={{ minWidth: 0 }}>
              <Text size="sm" fw={600} truncate>
                {file.name}
              </Text>
              <Text size="xs" c="dimmed">
                {file.size}
              </Text>
            </Box>
            <StatusBadge
              file={file}
              presentation={presentation}
              StatusIcon={StatusIcon}
            />
          </Stack>
        </Group>
        <Box h={72} style={{ flex: "1 1 54%", minWidth: 420 }}>
          <TagsInput
            value={file.tags}
            onChange={onTagsChange}
            disabled={!tagEditable}
            size="sm"
            placeholder="Tagを追加"
            styles={{
              root: { height: "100%" },
              wrapper: { height: "100%" },
              input: {
                minHeight: "72px",
                height: "72px",
                alignContent: "flex-start",
                paddingTop: "8px",
                paddingBottom: "8px",
              },
            }}
          />
        </Box>
        <Box w={36} style={{ flex: "0 0 36px" }}>
          <Button
            variant="subtle"
            color="gray"
            size="compact-sm"
            disabled={!removable}
            onClick={onRemove}
            aria-label={`${file.name}を削除`}
          >
            <IconTrash size={16} />
          </Button>
        </Box>
      </Group>
    </Box>
  )
}

function StatusBadge({
  file,
  presentation,
  StatusIcon,
}: {
  file: UploadFile
  presentation: { label: string; color: string }
  StatusIcon: typeof IconCheck
}) {
  const badge = (
    <Badge
      variant="light"
      color={presentation.color}
      leftSection={<StatusIcon size={12} />}
      style={{ cursor: file.reason ? "pointer" : undefined }}
    >
      {presentation.label}
    </Badge>
  )

  return (
    <Group gap={4} wrap="nowrap" style={{ flex: "0 0 auto" }}>
      {file.reason ? (
        <Popover width={300} position="bottom-start" withArrow shadow="md">
          <Popover.Target>
            <Box
              component="button"
              type="button"
              p={0}
              bg="transparent"
              style={{ border: 0, cursor: "pointer" }}
            >
              {badge}
            </Box>
          </Popover.Target>
          <Popover.Dropdown>
            <Stack gap={4}>
              <Text size="sm" fw={600}>
                {presentation.label}
              </Text>
              <Text size="sm">{file.reason}</Text>
            </Stack>
          </Popover.Dropdown>
        </Popover>
      ) : (
        badge
      )}
      {file.status === "upload-failed" && (
        <Badge
          variant="outline"
          color="gray"
          leftSection={<IconRefresh size={12} />}
        >
          再試行可能
        </Badge>
      )}
    </Group>
  )
}
