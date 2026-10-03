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
  | "empty" | "ready" | "validation-errors" | "uploading" | "partial-failure"
  | "all-failed" | "non-retryable-failure" | "result-unknown" | "processing"
  | "completed" | "processing-failure" | "leave-confirmation"

type FileStatus =
  | "ready" | "validation-error" | "uploading" | "upload-failed" | "upload-rejected"
  | "result-unknown" | "processing" | "completed" | "processing-failed"

type UploadFile = { id: string; name: string; size: string; status: FileStatus; reason?: string; tags: string[] }

const fixtures: Record<Exclude<UploadScenario, "empty" | "leave-confirmation">, UploadFile[]> = {
  ready: [
    { id: "1", name: "IMG_1842.HEIC", size: "8.4 MB", status: "ready", tags: ["旅行"] },
    { id: "2", name: "IMG_1843.HEIC", size: "7.9 MB", status: "ready", tags: ["旅行"] },
    { id: "3", name: "sunset.webp", size: "3.1 MB", status: "ready", tags: [] },
  ],
  "validation-errors": [
    { id: "1", name: "IMG_1842.HEIC", size: "8.4 MB", status: "ready", tags: ["旅行"] },
    { id: "2", name: "panorama.png", size: "142.6 MB", status: "validation-error", reason: "ファイルサイズが128 MiBを超えています", tags: [] },
    { id: "3", name: "document.gif", size: "2.2 MB", status: "validation-error", reason: "対応していない画像形式です", tags: [] },
    { id: "4", name: "sunset.webp", size: "3.1 MB", status: "ready", tags: [] },
  ],
  uploading: [
    { id: "1", name: "IMG_1842.HEIC", size: "8.4 MB", status: "uploading", tags: ["旅行"] },
    { id: "2", name: "IMG_1843.HEIC", size: "7.9 MB", status: "processing", tags: ["旅行"] },
    { id: "3", name: "sunset.webp", size: "3.1 MB", status: "ready", tags: [] },
  ],
  "partial-failure": [
    { id: "1", name: "IMG_1842.HEIC", size: "8.4 MB", status: "completed", tags: ["旅行"] },
    { id: "2", name: "IMG_1843.HEIC", size: "7.9 MB", status: "upload-failed", reason: "通信状態を確認して再試行してください", tags: ["旅行"] },
    { id: "3", name: "sunset.webp", size: "3.1 MB", status: "processing", tags: [] },
  ],
  "all-failed": [
    { id: "1", name: "IMG_1842.HEIC", size: "8.4 MB", status: "upload-failed", reason: "通信状態を確認して再試行してください", tags: ["旅行"] },
    { id: "2", name: "IMG_1843.HEIC", size: "7.9 MB", status: "upload-failed", reason: "通信状態を確認して再試行してください", tags: ["旅行"] },
  ],
  "non-retryable-failure": [
    { id: "1", name: "IMG_1842.HEIC", size: "8.4 MB", status: "upload-rejected", reason: "このMediaをアップロードする権限がありません", tags: ["旅行"] },
    { id: "2", name: "sunset.webp", size: "3.1 MB", status: "ready", tags: [] },
  ],
  "result-unknown": [
    { id: "1", name: "IMG_1842.HEIC", size: "8.4 MB", status: "result-unknown", reason: "送信結果を確認しています。確認が終わるまで再送信しません", tags: ["旅行"] },
    { id: "2", name: "sunset.webp", size: "3.1 MB", status: "ready", tags: [] },
  ],
  processing: [
    { id: "1", name: "IMG_1842.HEIC", size: "8.4 MB", status: "completed", tags: ["旅行"] },
    { id: "2", name: "IMG_1843.HEIC", size: "7.9 MB", status: "processing", tags: ["旅行"] },
    { id: "3", name: "sunset.webp", size: "3.1 MB", status: "processing", tags: [] },
  ],
  completed: [
    { id: "1", name: "IMG_1842.HEIC", size: "8.4 MB", status: "completed", tags: ["旅行"] },
    { id: "2", name: "IMG_1843.HEIC", size: "7.9 MB", status: "completed", tags: ["旅行"] },
    { id: "3", name: "sunset.webp", size: "3.1 MB", status: "completed", tags: [] },
  ],
  "processing-failure": [
    { id: "1", name: "IMG_1842.HEIC", size: "8.4 MB", status: "completed", tags: ["旅行"] },
    { id: "2", name: "IMG_1843.HEIC", size: "7.9 MB", status: "processing-failed", reason: "Mediaは登録されていますが、表示用画像を生成できませんでした", tags: ["旅行"] },
    { id: "3", name: "sunset.webp", size: "3.1 MB", status: "completed", tags: [] },
  ],
}

const statusPresentation: Record<FileStatus, { label: string; color: string; icon: typeof IconCheck }> = {
  ready: { label: "準備完了", color: "gray", icon: IconClock },
  "validation-error": { label: "アップロード不可", color: "red", icon: IconAlertCircle },
  uploading: { label: "アップロード中", color: "blue", icon: IconCloudUpload },
  "upload-failed": { label: "アップロード失敗", color: "red", icon: IconAlertCircle },
  "upload-rejected": { label: "アップロード不可", color: "red", icon: IconAlertCircle },
  "result-unknown": { label: "結果を確認中", color: "yellow", icon: IconHelpCircle },
  processing: { label: "画像処理中", color: "blue", icon: IconClock },
  completed: { label: "完了", color: "green", icon: IconCheck },
  "processing-failed": { label: "画像処理失敗", color: "red", icon: IconAlertCircle },
}

const contexts = {
  personal: { id: "personal", kind: "personal" as const, label: "Personal", accentColor: "var(--mantine-color-blue-6)" },
  community: { id: "community", kind: "community" as const, label: "家族のアルバム", accentColor: "var(--mantine-color-teal-6)" },
}

const selectableStatuses: FileStatus[] = ["ready", "upload-failed"]
const removableStatuses: FileStatus[] = ["ready", "validation-error", "upload-failed", "upload-rejected"]

export function MediaUploadPrototype({ scenario = "ready", context = "personal" }: {
  scenario?: UploadScenario
  context?: "personal" | "community"
}) {
  const compact = useMediaQuery("(max-width: 48em)")
  const initialFiles = scenario === "empty" ? [] : scenario === "leave-confirmation" ? fixtures.ready : fixtures[scenario]
  const [files, setFiles] = useState<UploadFile[]>(initialFiles)
  const [selectedIds, setSelectedIds] = useState<string[]>(
    initialFiles.filter((file) => selectableStatuses.includes(file.status)).map((file) => file.id),
  )
  const [bulkTag, setBulkTag] = useState("")
  const currentContext = contexts[context]

  const selectableFiles = files.filter((file) => selectableStatuses.includes(file.status))
  const selectedFiles = selectableFiles.filter((file) => selectedIds.includes(file.id))
  const activeUpload = files.some((file) => file.status === "uploading")
  const registeredCount = files.filter((file) => ["processing", "completed", "processing-failed"].includes(file.status)).length
  const completedCount = files.filter((file) => file.status === "completed").length
  const processingCount = files.filter((file) => file.status === "processing").length
  const failedCount = files.filter((file) => file.status === "upload-failed").length
  const invalidCount = files.filter((file) => file.status === "validation-error").length
  const unknownCount = files.filter((file) => file.status === "result-unknown").length
  const allSelectableChecked = selectableFiles.length > 0 && selectedFiles.length === selectableFiles.length

  const toggleAll = () => setSelectedIds(allSelectableChecked ? [] : selectableFiles.map((file) => file.id))
  const toggleFile = (id: string, checked: boolean) =>
    setSelectedIds((current) => checked ? [...new Set([...current, id])] : current.filter((item) => item !== id))

  const applyTagAction = (action: "add" | "remove" | "replace") => {
    const tag = bulkTag.trim()
    if (!tag || selectedIds.length === 0) return
    setFiles((current) => current.map((file) => {
      if (!selectedIds.includes(file.id)) return file
      if (action === "replace") return { ...file, tags: [tag] }
      if (action === "remove") return { ...file, tags: file.tags.filter((item) => item !== tag) }
      return { ...file, tags: file.tags.includes(tag) ? file.tags : [...file.tags, tag] }
    }))
    setBulkTag("")
  }

  const removeFile = (id: string) => {
    setFiles((current) => current.filter((file) => file.id !== id))
    setSelectedIds((current) => current.filter((item) => item !== id))
  }
  const removeAll = () => { setFiles([]); setSelectedIds([]) }
  const updateTags = (id: string, tags: string[]) =>
    setFiles((current) => current.map((file) => file.id === id ? { ...file, tags } : file))

  return (
    <ApplicationShell
      currentContext={currentContext}
      contexts={Object.values(contexts)}
      navigationItems={[{ id: "media", label: "メディア", icon: IconPhoto, active: true }]}
      user={{ displayName: "ユーザー" }}
      onSelectContext={() => undefined}
      onSelectNavigation={() => undefined}
      onOpenSettings={() => undefined}
      onLogout={() => undefined}
    >
      <Box maw={1120} mx="auto" w="100%" pb={88}>
        <Stack gap="lg">
          <Paper withBorder radius="md" p={files.length === 0 ? "xl" : "md"} style={{ borderStyle: "dashed" }}>
            <Stack align="center" gap="sm" py={files.length === 0 ? 36 : 4}>
              <ThemeIcon variant="light" size={files.length === 0 ? 52 : 36} radius="xl">
                <IconPhotoPlus size={files.length === 0 ? 28 : 20} />
              </ThemeIcon>
              <Box ta="center">
                <Text fw={600}>{files.length === 0 ? "画像をここにドロップ" : "画像をさらに追加"}</Text>
                <Text size="sm" c="dimmed" mt={2}>JPEG / PNG / WebP / HEIC・HEIF ・ 最大100件 ・ 1件128 MiBまで</Text>
              </Box>
              <Button variant="default" size="sm">ファイルを選択</Button>
            </Stack>
          </Paper>

          {files.length > 0 && (
            <>
              {invalidCount > 0 && (
                <FeedbackAlert kind="warning" title="アップロードできないファイルがあります">
                  問題のあるファイルは選択できません。修正または削除してからアップロードしてください。
                </FeedbackAlert>
              )}
              {failedCount > 0 && (
                <FeedbackAlert kind="warning" title={failedCount === files.length ? "アップロードに失敗しました" : "一部のアップロードに失敗しました"}>
                  成功済みのMediaは保持されています。再試行できるファイルだけを選択して送信できます。
                </FeedbackAlert>
              )}
              {unknownCount > 0 && (
                <FeedbackAlert kind="warning" title="送信結果を確認しているMediaがあります">
                  結果が確定するまで再送信しません。重複登録を防ぐため、このMediaは選択できません。
                </FeedbackAlert>
              )}
              {scenario === "processing-failure" && (
                <FeedbackAlert kind="error" title="画像処理に失敗したMediaがあります">
                  Media登録は完了しています。再アップロードせず、Media Browserで状態を確認できます。
                </FeedbackAlert>
              )}
              {scenario === "completed" && (
                <FeedbackAlert kind="success" title="アップロードが完了しました">すべての画像をMediaとして利用できます。</FeedbackAlert>
              )}

              <Paper withBorder radius="md" style={{ overflow: "hidden" }}>
                {!activeUpload && selectableFiles.length > 0 && (
                  <Box p="sm">
                    <Group align="center" wrap={compact ? "wrap" : "nowrap"}>
                      <Checkbox
                        checked={allSelectableChecked}
                        indeterminate={selectedFiles.length > 0 && !allSelectableChecked}
                        onChange={toggleAll}
                        aria-label="アップロード可能なMediaをすべて選択"
                      />
                      <Text size="sm" fw={600} style={{ minWidth: 88 }}>{selectedFiles.length}件選択</Text>
                      <Group gap="xs" style={{ flex: 1 }} wrap={compact ? "wrap" : "nowrap"}>
                        <TextInput
                          value={bulkTag}
                          onChange={(event) => setBulkTag(event.currentTarget.value)}
                          placeholder="選択したMediaのTag"
                          style={{ flex: 1, minWidth: compact ? "100%" : 200 }}
                        />
                        <Group gap={4} wrap="nowrap">
                          <Button variant="default" size="sm" disabled={!bulkTag.trim() || selectedFiles.length === 0} onClick={() => applyTagAction("add")}>追加</Button>
                          <Button variant="default" size="sm" disabled={!bulkTag.trim() || selectedFiles.length === 0} onClick={() => applyTagAction("remove")}>除去</Button>
                          <Button variant="default" size="sm" disabled={!bulkTag.trim() || selectedFiles.length === 0} onClick={() => applyTagAction("replace")}>置換</Button>
                        </Group>
                      </Group>
                      <Button
                        variant="subtle"
                        color="gray"
                        size="sm"
                        leftSection={<IconTrash size={16} />}
                        onClick={removeAll}
                      >
                        すべて削除
                      </Button>
                    </Group>
                  </Box>
                )}

                {activeUpload && (
                  <Box p="sm">
                    <Text size="sm" fw={600}>アップロード中 ・ Media登録済み {registeredCount}件</Text>
                  </Box>
                )}

                <Divider />

                <Box>
                  {files.map((file, index) => (
                    <Box key={file.id}>
                      {index > 0 && <Divider />}
                      <FileRow
                        file={file}
                        compact={compact}
                        selected={selectedIds.includes(file.id)}
                        selectable={selectableStatuses.includes(file.status) && !activeUpload}
                        onSelect={(checked) => toggleFile(file.id, checked)}
                        onRemove={() => removeFile(file.id)}
                        onTagsChange={(tags) => updateTags(file.id, tags)}
                      />
                    </Box>
                  ))}
                </Box>
              </Paper>

              {(processingCount > 0 || completedCount > 0) && (
                <Text size="sm" c="dimmed">
                  Media登録済み {registeredCount}件
                  {processingCount > 0 ? ` ・ 画像処理中 ${processingCount}件` : ""}
                  {completedCount > 0 ? ` ・ 完了 ${completedCount}件` : ""}
                </Text>
              )}
            </>
          )}
        </Stack>
      </Box>

      {files.length > 0 && (
        <Box style={{
          position: "fixed", left: 0, right: 0, bottom: 0, zIndex: 100,
          borderTop: "1px solid var(--mantine-color-default-border)",
          background: "var(--mantine-color-body)",
        }}>
          <Box maw={1120} mx="auto" px="lg" py="sm">
            <Group justify="flex-end" wrap="nowrap">
              {activeUpload ? (
                <Text size="sm" fw={600}>アップロード中 ・ Media登録済み {registeredCount}件</Text>
              ) : (
                <>
                  <Text size="sm" c="dimmed">{selectedFiles.length}件選択中</Text>
                  <Button disabled={selectedFiles.length === 0}>選択した{selectedFiles.length}件をアップロード</Button>
                </>
              )}
            </Group>
          </Box>
        </Box>
      )}

      <Modal opened={scenario === "leave-confirmation"} onClose={() => undefined} title="アップロード画面を離れますか？" centered>
        <Stack>
          <Text size="sm">まだアップロードしていない画像があります。この画面を離れると、未送信の画像と編集内容は失われます。</Text>
          <Group justify="flex-end">
            <Button variant="default">この画面に残る</Button>
            <Button color="red">移動する</Button>
          </Group>
        </Stack>
      </Modal>
    </ApplicationShell>
  )
}

function FileRow({ file, compact, selected, selectable, onSelect, onRemove, onTagsChange }: {
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
        <Group align="flex-start" wrap="nowrap">
          <Checkbox mt={18} checked={selected} disabled={!selectable} onChange={(e) => onSelect(e.currentTarget.checked)} aria-label={`${file.name}を選択`} />
          <Box w={56} h={56} style={{ flex: "0 0 auto", borderRadius: "var(--mantine-radius-sm)", background: "var(--mantine-color-default-hover)", display: "grid", placeItems: "center" }}>
            <IconPhoto size={22} stroke={1.4} />
          </Box>
          <Stack gap={8} style={{ flex: 1, minWidth: 0 }}>
            <Group justify="space-between" wrap="nowrap">
              <Box style={{ minWidth: 0 }}>
                <Text size="sm" fw={600} truncate>{file.name}</Text>
                <Text size="xs" c="dimmed">{file.size}</Text>
              </Box>
              {removable && <Button variant="subtle" color="gray" size="compact-sm" onClick={onRemove} aria-label={`${file.name}を削除`}><IconTrash size={16} /></Button>}
            </Group>
            <Status file={file} presentation={presentation} StatusIcon={StatusIcon} />
            <TagsInput value={file.tags} onChange={onTagsChange} disabled={!tagEditable} size="xs" placeholder="Tagを追加" />
          </Stack>
        </Group>
      </Box>
    )
  }

  return (
    <Box p="sm">
      <Group align="stretch" wrap="nowrap" gap="md">
        <Checkbox mt={26} checked={selected} disabled={!selectable} onChange={(e) => onSelect(e.currentTarget.checked)} aria-label={`${file.name}を選択`} />
        <Group align="flex-start" wrap="nowrap" gap="sm" style={{ flex: "1 1 58%", minWidth: 0 }}>
          <Box w={76} h={64} style={{ flex: "0 0 auto", borderRadius: "var(--mantine-radius-sm)", background: "var(--mantine-color-default-hover)", display: "grid", placeItems: "center" }}>
            <IconPhoto size={28} stroke={1.4} />
          </Box>
          <Stack gap={6} style={{ flex: 1, minWidth: 0 }}>
            <Box>
              <Text size="sm" fw={600} truncate>{file.name}</Text>
              <Text size="xs" c="dimmed">{file.size}</Text>
            </Box>
            <TagsInput value={file.tags} onChange={onTagsChange} disabled={!tagEditable} size="xs" placeholder="Tagを追加" />
          </Stack>
        </Group>
        <Box style={{ flex: "0 0 30%", minWidth: 210, paddingTop: 4 }}>
          <Status file={file} presentation={presentation} StatusIcon={StatusIcon} />
        </Box>
        <Box w={36} style={{ flex: "0 0 36px", paddingTop: 18 }}>
          {removable && <Button variant="subtle" color="gray" size="compact-sm" onClick={onRemove} aria-label={`${file.name}を削除`}><IconTrash size={16} /></Button>}
        </Box>
      </Group>
    </Box>
  )
}

function Status({ file, presentation, StatusIcon }: {
  file: UploadFile
  presentation: { label: string; color: string }
  StatusIcon: typeof IconCheck
}) {
  return (
    <Stack gap={5}>
      <Group gap={6}>
        <Badge variant="light" color={presentation.color} leftSection={<StatusIcon size={12} />}>{presentation.label}</Badge>
        {file.status === "upload-failed" && <Badge variant="outline" color="gray" leftSection={<IconRefresh size={12} />}>再試行可能</Badge>}
      </Group>
      {file.status === "uploading" && <Text size="xs" c="dimmed">送信しています</Text>}
      {file.reason && <Text size="xs" c="red">{file.reason}</Text>}
    </Stack>
  )
}
