"use client"

import {
  Box,
  Button,
  Group,
  Modal,
  Paper,
  Stack,
  Text,
  ThemeIcon,
} from "@mantine/core"
import { IconPhotoPlus } from "@tabler/icons-react"
import { useState } from "react"
import { getApplicationNavigation } from "@/components/ApplicationShell"
import { FeedbackAlert } from "@/components/Feedback"
import { MediaTagEditor } from "@/components/MediaTagEditor"
import { PrototypeApplicationShell } from "@/prototypes/PrototypeApplicationShell"

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

export function MediaUploadPrototype({
  scenario = "ready",
  context = "personal",
}: {
  scenario?: UploadScenario
  context?: "personal" | "community"
}) {
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
  const failedCount = files.filter(
    (file) => file.status === "upload-failed",
  ).length
  const invalidCount = files.filter(
    (file) => file.status === "validation-error",
  ).length
  const unknownCount = files.filter(
    (file) => file.status === "result-unknown",
  ).length
  const updateTags = (id: string, tags: string[]) =>
    setFiles((current) =>
      current.map((file) => (file.id === id ? { ...file, tags } : file)),
    )

  return (
    <PrototypeApplicationShell
      currentContext={currentContext}
      contexts={Object.values(contexts)}
      navigationItems={getApplicationNavigation({
        contextKind: currentContext.kind,
        activeSection: "media",
      })}
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
                <MediaTagEditor
                  items={selectableFiles.map((file) => ({
                    id: file.id,
                    label: file.name,
                    tags: file.tags,
                  }))}
                  selectedIds={selectedIds}
                  onSelectedIdsChange={setSelectedIds}
                  onTagsChange={updateTags}
                />

                {files.some((file) => !selectableStatuses.includes(file.status)) && (
                  <Paper withBorder radius="md" p="sm">
                    <Text size="sm" c="dimmed">
                      Upload中・処理中・完了済み・Validation errorのMediaはTag編集対象から除外されています。
                    </Text>
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
    </PrototypeApplicationShell>
  )
}

