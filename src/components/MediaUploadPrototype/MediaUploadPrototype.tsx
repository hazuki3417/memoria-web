"use client"

import {
  Badge,
  Box,
  Button,
  Group,
  Paper,
  Progress,
  Stack,
  Text,
  TextInput,
  ThemeIcon,
  Title,
} from "@mantine/core"
import { useMediaQuery } from "@mantine/hooks"
import {
  IconAlertCircle,
  IconCheck,
  IconClock,
  IconCloudUpload,
  IconPhoto,
  IconPhotoPlus,
  IconRefresh,
  IconTrash,
} from "@tabler/icons-react"
import { useMemo, useState } from "react"
import { ApplicationShell } from "@/components/ApplicationShell"
import { FeedbackAlert } from "@/components/Feedback"
import { PageHeader } from "@/components/PageHeader"

export type UploadScenario =
  | "empty"
  | "ready"
  | "validation-errors"
  | "uploading"
  | "partial-failure"
  | "processing"
  | "completed"
  | "processing-failure"

type FileStatus =
  | "ready"
  | "validation-error"
  | "uploading"
  | "upload-failed"
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

const fixtures: Record<Exclude<UploadScenario, "empty">, UploadFile[]> = {
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
    { id: "2", name: "IMG_1843.HEIC", size: "7.9 MB", status: "uploading", tags: ["旅行"] },
    { id: "3", name: "sunset.webp", size: "3.1 MB", status: "ready", tags: [] },
  ],
  "partial-failure": [
    { id: "1", name: "IMG_1842.HEIC", size: "8.4 MB", status: "completed", tags: ["旅行"] },
    { id: "2", name: "IMG_1843.HEIC", size: "7.9 MB", status: "upload-failed", reason: "アップロードできませんでした。通信状態を確認して再試行してください", tags: ["旅行"] },
    { id: "3", name: "sunset.webp", size: "3.1 MB", status: "processing", tags: [] },
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
  ready: { label: "アップロード準備完了", color: "gray", icon: IconClock },
  "validation-error": { label: "アップロードできません", color: "red", icon: IconAlertCircle },
  uploading: { label: "アップロード中", color: "blue", icon: IconCloudUpload },
  "upload-failed": { label: "アップロード失敗", color: "red", icon: IconAlertCircle },
  processing: { label: "画像処理中", color: "blue", icon: IconClock },
  completed: { label: "完了", color: "green", icon: IconCheck },
  "processing-failed": { label: "画像処理失敗", color: "red", icon: IconAlertCircle },
}

const contexts = {
  personal: { id: "personal", kind: "personal" as const, label: "Personal", accentColor: "var(--mantine-color-blue-6)" },
  community: { id: "community", kind: "community" as const, label: "家族のアルバム", accentColor: "var(--mantine-color-teal-6)" },
}

export function MediaUploadPrototype({
  scenario = "ready",
  context = "personal",
}: {
  scenario?: UploadScenario
  context?: "personal" | "community"
}) {
  const compact = useMediaQuery("(max-width: 48em)")
  const [files, setFiles] = useState<UploadFile[]>(scenario === "empty" ? [] : fixtures[scenario])
  const [commonTag, setCommonTag] = useState("")
  const currentContext = contexts[context]

  const counts = useMemo(() => ({
    total: files.length,
    ready: files.filter((file) => file.status === "ready").length,
    invalid: files.filter((file) => file.status === "validation-error").length,
    failed: files.filter((file) => file.status === "upload-failed").length,
    processing: files.filter((file) => file.status === "processing").length,
    completed: files.filter((file) => file.status === "completed").length,
  }), [files])

  const activeUpload = files.some((file) => file.status === "uploading")
  const allRequestsSettled = files.length > 0 && files.every((file) =>
    ["completed", "processing", "upload-failed", "processing-failed"].includes(file.status),
  )

  const removeFile = (id: string) => setFiles((current) => current.filter((file) => file.id !== id))
  const retryFile = (id: string) => setFiles((current) => current.map((file) =>
    file.id === id ? { ...file, status: "uploading", reason: undefined } : file,
  ))
  const applyCommonTag = () => {
    const tag = commonTag.trim()
    if (!tag) return
    setFiles((current) => current.map((file) => ({
      ...file,
      tags: file.tags.includes(tag) ? file.tags : [...file.tags, tag],
    })))
    setCommonTag("")
  }

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
      <Box maw={1120} mx="auto" w="100%" pb={96}>
        <Stack gap="xl">
          <PageHeader
            title="メディアをアップロード"
            description={context === "community"
              ? "このCommunityが管理するMediaとして画像を追加します。"
              : "Personalで管理するMediaとして画像を追加します。"}
          />

          <Paper
            withBorder
            radius="md"
            p={files.length === 0 ? "xl" : "md"}
            style={{ borderStyle: "dashed" }}
          >
            <Stack align="center" gap="sm" py={files.length === 0 ? 36 : 4}>
              <ThemeIcon variant="light" size={files.length === 0 ? 52 : 36} radius="xl">
                <IconPhotoPlus size={files.length === 0 ? 28 : 20} />
              </ThemeIcon>
              <Box ta="center">
                <Text fw={600}>
                  {files.length === 0 ? "画像をここにドロップ" : "画像をさらに追加"}
                </Text>
                <Text size="sm" c="dimmed" mt={2}>
                  JPEG / PNG / WebP / HEIC・HEIF ・ 最大100件 ・ 1件128 MiBまで
                </Text>
              </Box>
              <Button variant="default" size="sm">ファイルを選択</Button>
            </Stack>
          </Paper>

          {files.length > 0 && (
            <>
              <Group justify="space-between" align="flex-start" wrap="wrap">
                <Box>
                  <Title order={2} size="h4">アップロードする画像</Title>
                  <Group gap="xs" mt={8}>
                    <Badge variant="light" color="gray">{counts.total}件</Badge>
                    {counts.invalid > 0 && <Badge variant="light" color="red">問題 {counts.invalid}件</Badge>}
                    {counts.processing > 0 && <Badge variant="light" color="blue">画像処理中 {counts.processing}件</Badge>}
                    {counts.completed > 0 && <Badge variant="light" color="green">完了 {counts.completed}件</Badge>}
                  </Group>
                </Box>
                {!activeUpload && !allRequestsSettled && (
                  <Button variant="subtle" color="gray" size="sm" onClick={() => setFiles([])}>
                    すべて削除
                  </Button>
                )}
              </Group>

              {counts.invalid > 0 && (
                <FeedbackAlert kind="warning" title="アップロードできないファイルがあります">
                  問題のあるファイルを除いて、アップロード可能な画像だけを送信できます。
                </FeedbackAlert>
              )}
              {counts.failed > 0 && (
                <FeedbackAlert kind="warning" title="一部のアップロードに失敗しました">
                  成功済みのMediaは保持されています。失敗したファイルだけ再試行できます。
                </FeedbackAlert>
              )}
              {scenario === "processing-failure" && (
                <FeedbackAlert kind="error" title="画像処理に失敗したMediaがあります">
                  Media登録は完了しています。画像処理失敗は再アップロードせず、Media Browserで確認できます。
                </FeedbackAlert>
              )}
              {scenario === "completed" && (
                <FeedbackAlert kind="success" title="アップロードが完了しました">
                  すべての画像をMediaとして利用できます。
                </FeedbackAlert>
              )}

              {!allRequestsSettled && !activeUpload && (
                <Paper withBorder radius="md" p="md">
                  <Stack gap="sm">
                    <Box>
                      <Text fw={600} size="sm">共通Tag</Text>
                      <Text c="dimmed" size="xs">
                        入力したTagを現在の画像へ追加します。各画像のTagは個別に調整できます。
                      </Text>
                    </Box>
                    <Group align="flex-end" wrap={compact ? "wrap" : "nowrap"}>
                      <TextInput
                        value={commonTag}
                        onChange={(event) => setCommonTag(event.currentTarget.value)}
                        placeholder="Tagを入力"
                        style={{ flex: 1 }}
                      />
                      <Button variant="default" onClick={applyCommonTag}>すべてに追加</Button>
                    </Group>
                  </Stack>
                </Paper>
              )}

              <Stack gap="sm">
                {files.map((file) => (
                  <FileRow
                    key={file.id}
                    file={file}
                    compact={compact}
                    locked={activeUpload || ["completed", "processing", "processing-failed"].includes(file.status)}
                    onRemove={() => removeFile(file.id)}
                    onRetry={() => retryFile(file.id)}
                  />
                ))}
              </Stack>
            </>
          )}
        </Stack>
      </Box>

      {files.length > 0 && (
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
            <Group justify="space-between" wrap="nowrap">
              <Button variant="default">Mediaへ戻る</Button>
              {activeUpload ? (
                <Box style={{ flex: 1, maxWidth: 360 }}>
                  <Group justify="space-between" mb={4}>
                    <Text size="xs" fw={600}>アップロード中</Text>
                    <Text size="xs" c="dimmed">ファイル単位で送信しています</Text>
                  </Group>
                  <Progress value={58} animated />
                </Box>
              ) : allRequestsSettled ? (
                <Button>Mediaを確認</Button>
              ) : (
                <Button disabled={counts.ready === 0}>
                  {counts.ready}件をアップロード
                </Button>
              )}
            </Group>
          </Box>
        </Box>
      )}
    </ApplicationShell>
  )
}

function FileRow({
  file,
  compact,
  locked,
  onRemove,
  onRetry,
}: {
  file: UploadFile
  compact: boolean
  locked: boolean
  onRemove: () => void
  onRetry: () => void
}) {
  const presentation = statusPresentation[file.status]
  const StatusIcon = presentation.icon

  return (
    <Paper withBorder radius="md" p="sm">
      <Group align="flex-start" wrap="nowrap">
        <Box
          w={compact ? 64 : 88}
          h={compact ? 64 : 72}
          style={{
            flex: "0 0 auto",
            borderRadius: "var(--mantine-radius-sm)",
            background: "var(--mantine-color-default-hover)",
            display: "grid",
            placeItems: "center",
          }}
        >
          <IconPhoto size={compact ? 24 : 30} stroke={1.4} />
        </Box>
        <Stack gap={6} style={{ flex: 1, minWidth: 0 }}>
          <Group justify="space-between" gap="xs" wrap="nowrap">
            <Box style={{ minWidth: 0 }}>
              <Text size="sm" fw={600} truncate>{file.name}</Text>
              <Text size="xs" c="dimmed">{file.size}</Text>
            </Box>
            {!locked && (
              <Button variant="subtle" color="gray" size="compact-sm" onClick={onRemove} aria-label={`${file.name}を削除`}>
                <IconTrash size={16} />
              </Button>
            )}
          </Group>
          <Group gap={6}>
            <Badge variant="light" color={presentation.color} leftSection={<StatusIcon size={12} />}>
              {presentation.label}
            </Badge>
            {file.status === "upload-failed" && (
              <Button variant="light" size="compact-xs" leftSection={<IconRefresh size={13} />} onClick={onRetry}>
                再試行
              </Button>
            )}
          </Group>
          {file.status === "uploading" && <Progress value={42} size="xs" animated />}
          {file.reason && <Text size="xs" c="red">{file.reason}</Text>}
          {file.tags.length > 0 && (
            <Group gap={4}>
              {file.tags.map((tag) => <Badge key={tag} size="xs" variant="outline" color="gray">{tag}</Badge>)}
            </Group>
          )}
        </Stack>
      </Group>
    </Paper>
  )
}
