import { describe, expect, it } from "vitest"
import { emptyUsage, mapUsageProjection } from "./usageGraphqlAdapter"

describe("GraphQL Usage表示Adapter", () => {
  it("APIのInt64文字列とcanonical形式を既存の表示契約に変換する", () => {
    expect(mapUsageProjection({
      mediaCount: 3,
      storage: { usedBytes: "1240000000", effectiveLimitBytes: "5000000000" },
      formatBreakdown: [
        { format: "JPEG", mediaCount: 1, usedBytes: "900000000" },
        { format: "PNG", mediaCount: 1, usedBytes: "200000000" },
        { format: "WEBP", mediaCount: 0, usedBytes: "0" },
        { format: "HEIF", mediaCount: 1, usedBytes: "140000000" },
      ],
    })).toEqual({
      usedBytes: 1_240_000_000,
      limitBytes: 5_000_000_000,
      mediaCount: 3,
      formatBreakdown: [
        { format: "JPEG", count: 1, sizeBytes: 900_000_000 },
        { format: "PNG", count: 1, sizeBytes: 200_000_000 },
        { format: "WebP", count: 0, sizeBytes: 0 },
        { format: "HEIC / HEIF", count: 1, sizeBytes: 140_000_000 },
      ],
    })
  })

  it("確定0件をLoading用の仮値と混同せず変換する", () => {
    const result = mapUsageProjection({
      mediaCount: 0,
      storage: { usedBytes: "0", effectiveLimitBytes: "5000000000" },
      formatBreakdown: [
        { format: "JPEG", mediaCount: 0, usedBytes: "0" },
        { format: "PNG", mediaCount: 0, usedBytes: "0" },
        { format: "WEBP", mediaCount: 0, usedBytes: "0" },
        { format: "HEIF", mediaCount: 0, usedBytes: "0" },
      ],
    })
    expect(result.usedBytes).toBe(0)
    expect(result.limitBytes).toBe(5_000_000_000)
    expect(result.formatBreakdown).toEqual([
      { format: "JPEG", count: 0, sizeBytes: 0 },
      { format: "PNG", count: 0, sizeBytes: 0 },
      { format: "WebP", count: 0, sizeBytes: 0 },
      { format: "HEIC / HEIF", count: 0, sizeBytes: 0 },
    ])
    expect(emptyUsage.limitBytes).toBe(0)
  })

  it("確定0件でもAPIの不正な形式別データを見逃さない", () => {
    expect(() => mapUsageProjection({
      mediaCount: 0,
      storage: { usedBytes: "0", effectiveLimitBytes: "5000000000" },
      formatBreakdown: [{ format: "HEIF", mediaCount: 0, usedBytes: "-1" }],
    })).toThrow()
  })

  it.each(["9007199254740992", "-1", "1.5", "1e6", "abc"])(
    "精度を喪失する、または不正なbyte値 %s を拒否する",
    (usedBytes) => {
      expect(() => mapUsageProjection({
        mediaCount: 1,
        storage: { usedBytes, effectiveLimitBytes: "5000000000" },
        formatBreakdown: [],
      })).toThrow()
    },
  )

  it("未対応formatや不正件数を推測で置換しない", () => {
    expect(() => mapUsageProjection({
      mediaCount: -1,
      storage: { usedBytes: "0", effectiveLimitBytes: "5000000000" },
      formatBreakdown: [],
    })).toThrow()
    expect(() => mapUsageProjection({
      mediaCount: 1,
      storage: { usedBytes: "1", effectiveLimitBytes: "5000000000" },
      formatBreakdown: [{ format: "UNKNOWN" as "JPEG", mediaCount: 1, usedBytes: "1" }],
    })).toThrow()
  })
})
