import { IconAlertCircle, IconCheck, IconClock, IconCloudUpload, IconHelpCircle } from "@tabler/icons-react"

export type FileStatus =
  | "ready"
  | "validation-error"
  | "uploading"
  | "upload-failed"
  | "upload-rejected"
  | "result-unknown"
  | "processing"
  | "completed"
  | "processing-failed"

export type UploadFile = {
  id: string
  name: string
  size: string
  status: FileStatus
  reason?: string
  tags: string[]
  original?: File
  idempotencyKey?: string
}

export const statusPresentation: Record<
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

