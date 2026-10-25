import { uploadMedia as generatedUploadMedia, type MediaUploadReceipt } from "@/infrastructure/openapi/generated/mediaUpload"

export type UploadScope =
  | { scopeType: "PERSONAL"; communityId?: never }
  | { scopeType: "COMMUNITY"; communityId: string }

export type { MediaUploadReceipt } from "@/infrastructure/openapi/generated/mediaUpload"

export class MediaUploadError extends Error {
  constructor(
    readonly code: string,
    message: string,
    readonly status: number,
    readonly resultUnknown: boolean,
  ) {
    super(message)
    this.name = "MediaUploadError"
  }
}

// The caller owns this key for the lifetime of one logical file command.
// Never silently retry ambiguous responses with a new key.
export async function uploadMedia(
  file: File,
  scope: UploadScope,
  idempotencyKey: string,
  signal?: AbortSignal,
): Promise<MediaUploadReceipt> {
  let response: Awaited<ReturnType<typeof generatedUploadMedia>>
  try {
    response = await generatedUploadMedia(
      { file, scopeType: scope.scopeType, ...(scope.scopeType === "COMMUNITY" ? { communityId: scope.communityId } : {}) },
      { headers: { "Idempotency-Key": idempotencyKey }, signal },
    )
  } catch {
    // Network errors or an unreadable JSON response leave the result ambiguous.
    // Never silently retry with another key.
    throw new MediaUploadError(
      "RESULT_UNKNOWN",
      "送信結果を確認できません。Media Browserで登録結果を確認してください。",
      0,
      true,
    )
  }

  const status: number = response.status
  if (status !== 201) {
    const failure = response.data as { error?: { code?: string; message?: string } }
    throw new MediaUploadError(
      failure?.error?.code ?? "UPLOAD_FAILED",
      failure?.error?.message ?? "アップロードに失敗しました",
      status,
      status === 502 || status === 504,
    )
  }

  // The generated response union is not narrowed through the numeric status alias.
  // Validate the receipt at runtime before returning it.
  const receipt = response.data as MediaUploadReceipt
  if (typeof receipt?.mediaId !== "string" || receipt.processingStatus !== "PROCESSING") {
    throw new MediaUploadError("RESULT_UNKNOWN", "Uploadの受付結果を確認できません", response.status, true)
  }
  return receipt
}

// Limit in-flight upload bodies. Each file retains its own success/failure.
export async function uploadMediaBatch<T>(
  items: readonly T[],
  worker: (item: T) => Promise<void>,
  concurrency = 3,
): Promise<void> {
  if (!Number.isInteger(concurrency) || concurrency < 1) throw new RangeError("invalid concurrency")
  let cursor = 0
  await Promise.all(Array.from({ length: Math.min(concurrency, items.length) }, async () => {
    while (cursor < items.length) {
      const item = items[cursor++]
      try {
        await worker(item)
      } catch {
        // Each worker reports its own failure; remaining files must still be processed.
      }
    }
  }))
}
