import { describe, expect, it } from "vitest"
import { formatMediaDetailDate } from "./formatMediaDetailDate"
import { formatFileSize } from "@/features/usage/formatFileSize"

describe("Media Detail preference formatting", () => {
  const uploadedAt = "2026-10-03T08:42:00"
  it("uses the selected date order while retaining local time", () => {
    expect(formatMediaDetailDate(uploadedAt, "YYYY_MM_DD")).toBe(
      "2026/10/03 08:42",
    )
    expect(formatMediaDetailDate(uploadedAt, "MM_DD_YYYY")).toBe(
      "10/03/2026 08:42",
    )
    expect(formatMediaDetailDate(uploadedAt, "DD_MM_YYYY")).toBe(
      "03/10/2026 08:42",
    )
  })
  it("does not display invalid dates as valid timestamps", () => {
    expect(formatMediaDetailDate("invalid")).toBe("-")
  })
  it("uses the shared decimal and binary file-size formatter", () => {
    expect(formatFileSize(1_000_000_000, "DECIMAL")).toEqual({
      value: "1",
      unit: "GB",
    })
    expect(formatFileSize(1_073_741_824, "BINARY")).toEqual({
      value: "1",
      unit: "GiB",
    })
  })
})
