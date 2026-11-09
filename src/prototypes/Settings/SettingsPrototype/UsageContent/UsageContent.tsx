"use client"

import { useState } from "react"
import { Usage, type UsageData } from "@/features/usage"
import { SettingsContentStatus } from "@/components/SettingsContentStatus/SettingsContentStatus"

// Deterministic Storybook sample data; these values are not product values.
const MOCK_USAGE: UsageData = {
  usedBytes: 1_240_000_000,
  limitBytes: 5_000_000_000,
  mediaCount: 1248,
  formatBreakdown: [
    { format: "JPEG", count: 900, sizeBytes: 900_000_000 },
    { format: "PNG", count: 200, sizeBytes: 200_000_000 },
    { format: "WebP", count: 100, sizeBytes: 100_000_000 },
    { format: "HEIC / HEIF", count: 48, sizeBytes: 40_000_000 },
  ],
}

export type UsageScenario =
  | "default"
  | "loading"
  | "retrying"
  | "error"
  | "error-no-retry"
  | "retry-error"
  | "zero"
  | "limit-reached"

const ZERO_USAGE: UsageData = {
  usedBytes: 0,
  limitBytes: 5_000_000_000,
  mediaCount: 0,
  formatBreakdown: [],
}

const LIMIT_REACHED_USAGE: UsageData = {
  usedBytes: 5_000_000_000,
  limitBytes: 5_000_000_000,
  mediaCount: 5000,
  formatBreakdown: [
    { format: "JPEG", count: 3500, sizeBytes: 3_500_000_000 },
    { format: "PNG", count: 1500, sizeBytes: 1_500_000_000 },
  ],
}

export function UsageContent({
  initialScenario,
  fileSizeUnit,
}: {
  initialScenario: UsageScenario
  fileSizeUnit: "DECIMAL" | "BINARY"
}) {
  const [scenario] = useState<UsageScenario | "retrying">(
    initialScenario === "retry-error" ? "error" : initialScenario,
  )
  let usage = MOCK_USAGE
  switch (scenario) {
    case "zero":
      usage = ZERO_USAGE
      break
    case "limit-reached":
      usage = LIMIT_REACHED_USAGE
      break
  }

  let status: "loading" | "error" | "ready" = "ready"
  switch (scenario) {
    case "loading":
    case "retrying":
      status = "loading"
      break
    case "error":
    case "error-no-retry":
      status = "error"
      break
  }

  return (
    <SettingsContentStatus
      state={status}
      label="利用状況を読み込み中"
    >
      <Usage usage={usage} fileSizeUnit={fileSizeUnit} />
    </SettingsContentStatus>
  )
}
