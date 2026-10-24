export type UploadScope =
  | { scopeType: "PERSONAL"; communityId?: never }
  | { scopeType: "COMMUNITY"; communityId: string }

export type MediaUploadReceipt = {
  mediaId: string
  processingStatus: "PROCESSING"
}

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
  const body = new FormData()
  body.set("file", file, file.name)
  body.set("scopeType", scope.scopeType)
  if (scope.scopeType === "COMMUNITY") body.set("communityId", scope.communityId)

  let response: Response
  try {
    response = await fetch("/api/media/uploads", {
      method: "POST",
      headers: { "Idempotency-Key": idempotencyKey },
      body,
      signal,
    })
  } catch {
    throw new MediaUploadError(
      "RESULT_UNKNOWN",
      "送信結果を確認できません。Media Browserで登録結果を確認してください。",
      0,
      true,
    )
  }

  let result: unknown
  try {
    result = await response.json()
  } catch {
    throw new MediaUploadError(
      "RESULT_UNKNOWN",
      "送信結果を確認できません。Media Browserで登録結果を確認してください。",
      response.status,
      true,
    )
  }

  if (!response.ok) {
    const error = (result as { error?: { code?: string; message?: string } })?.error
    throw new MediaUploadError(
      error?.code ?? "UPLOAD_FAILED",
      error?.message ?? "アップロードに失敗しました",
      response.status,
      response.status === 502 || response.status === 504,
    )
  }

  const receipt = result as Partial<MediaUploadReceipt>
  if (typeof receipt?.mediaId !== "string" || receipt.processingStatus !== "PROCESSING") {
    throw new MediaUploadError("RESULT_UNKNOWN", "Uploadの受付結果を確認できません", response.status, true)
  }
  return receipt as MediaUploadReceipt
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
