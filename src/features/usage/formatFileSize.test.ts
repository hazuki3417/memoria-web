import { describe, expect, it } from "vitest"
import { formatFileSize } from "./formatFileSize"

describe("ファイルサイズの表示値と単位", () => {
  it("Decimalで値と単位を個別に返す", () => {
    expect(formatFileSize(1_240_000_000)).toEqual({ value: "1.24", unit: "GB" })
    expect(formatFileSize(900_000_000)).toEqual({ value: "0.90", unit: "GB" })
    expect(formatFileSize(5_000_000_000)).toEqual({ value: "5", unit: "GB" })
    expect(formatFileSize(0)).toEqual({ value: "0", unit: "GB" })
  })

  it("Binaryで1024基準の値と明示的な単位を返す", () => {
    expect(formatFileSize(1_073_741_824, "BINARY")).toEqual({
      value: "1",
      unit: "GiB",
    })
    expect(formatFileSize(5_000_000_000, "BINARY")).toEqual({
      value: "4.66",
      unit: "GiB",
    })
    expect(formatFileSize(0, "BINARY")).toEqual({ value: "0", unit: "GiB" })
  })

  it("小さな非ゼロの容量は適切な単位へ変換する", () => {
    expect(formatFileSize(1000)).toEqual({ value: "1", unit: "KB" })
    expect(formatFileSize(1024, "BINARY")).toEqual({ value: "1", unit: "KiB" })
  })

  it("値へ単位や空白を混ぜない", () => {
    const size = formatFileSize(1_240_000_000)
    expect(size.value).toBe("1.24")
    expect(size.unit).toBe("GB")
  })
})
