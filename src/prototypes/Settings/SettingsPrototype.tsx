"use client"


import { useState, type ReactNode } from "react"
import { Button, Text } from "@mantine/core"
import { useMediaQuery } from "@mantine/hooks"
import {
  SettingsLayout,
  SettingsProfile,
  SettingsPreferences,
  SettingsAccount,
  type Section,
} from "@/features/settings"
import { SettingsUsage, type SettingsUsageData } from "@/features/usage"
import { getApplicationNavigation } from "@/components/ApplicationShell"
import { PrototypeApplicationShell } from "@/prototypes/PrototypeApplicationShell"

type ProfileSaveState = "idle" | "saving" | "retryable-error" | "blocked"

// Deterministic Storybook sample data; these values are not product values.
const MOCK_USAGE: SettingsUsageData = {
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

type UsageScenario =
  | "default"
  | "loading"
  | "retrying"
  | "error"
  | "error-no-retry"
  | "retry-error"
  | "zero"
  | "limit-reached"

const ZERO_USAGE: SettingsUsageData = {
  usedBytes: 0,
  limitBytes: 5_000_000_000,
  mediaCount: 0,
  formatBreakdown: [],
}

const LIMIT_REACHED_USAGE: SettingsUsageData = {
  usedBytes: 5_000_000_000,
  limitBytes: 5_000_000_000,
  mediaCount: 5000,
  formatBreakdown: [
    { format: "JPEG", count: 3500, sizeBytes: 3_500_000_000 },
    { format: "PNG", count: 1500, sizeBytes: 1_500_000_000 },
  ],
}

function UsageContent({
  initialScenario,
  fileSizeUnit,
}: {
  initialScenario: UsageScenario
  fileSizeUnit: "DECIMAL" | "BINARY"
}) {
  const [scenario, setScenario] = useState<UsageScenario | "retrying">(
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

  const retry = async () => {
    if (scenario !== "error") return
    setScenario("retrying")
    // Story fixture: both the retry in progress and its result can be observed.
    await new Promise((resolve) => setTimeout(resolve, 600))
    setScenario(initialScenario === "retry-error" ? "error" : "default")
  }

  return (
    <SettingsUsage
      usage={usage}
      fileSizeUnit={fileSizeUnit}
      status={status}
      onRetry={initialScenario === "error-no-retry" ? undefined : retry}
    />
  )
}

// Storybook / Prototype専用。製品本体へモックの成功動作を混入させない。
async function saveMockProfile(): Promise<void> {
  await new Promise((resolve) => setTimeout(resolve, 500))
}

export function SettingsPrototype({
  initialSection = "profile",
  initialProfileSaveState = "idle",
  initialUsageScenario = "default",
  initialUsageFileSizeUnit = "DECIMAL",
}: {
  initialSection?: Section
  initialProfileSaveState?: ProfileSaveState
  initialUsageScenario?: UsageScenario
  initialUsageFileSizeUnit?: "DECIMAL" | "BINARY"
}) {
  const compact = useMediaQuery("(max-width: 48em)")
  const [section, setSection] = useState<Section>(initialSection)
  const currentLabel = (
    {
      profile: "プロフィール",
      account: "アカウント",
      preferences: "環境設定",
      usage: "利用状況",
    } as const
  )[section]

  let content: ReactNode
  switch (section) {
    case "profile":
      content = (
        <SettingsProfile
          onSave={saveMockProfile}
          initialSaveState={initialProfileSaveState}
          blockedMessage="Userの状態が変わったため、この画面での変更を続けられません。ページを再読み込みして現在の状態を確認してください。"
        />
      )
      break
    case "preferences":
      content = <SettingsPreferences compact={compact} />
      break
    case "usage":
      content = (
        <UsageContent
          initialScenario={initialUsageScenario}
          fileSizeUnit={initialUsageFileSizeUnit}
        />
      )
      break
    case "account":
      content = (
        <SettingsAccount
          deletionAction={
            <Button variant="default" size="sm">
              アカウントを削除する
            </Button>
          }
        />
      )
      break
  }

  return (
    <PrototypeApplicationShell
      currentContext={{
        id: "personal",
        kind: "personal",
        label: "Personal",
        accentColor: "var(--mantine-color-blue-6)",
      }}
      contexts={[
        {
          id: "personal",
          kind: "personal",
          label: "Personal",
          accentColor: "var(--mantine-color-blue-6)",
        },
        {
          id: "family",
          kind: "community",
          label: "家族のアルバム",
          accentColor: "var(--mantine-color-teal-6)",
        },
        {
          id: "travel",
          kind: "community",
          label: "旅行の思い出",
          accentColor: "var(--mantine-color-violet-6)",
        },
      ]}
      navigationItems={getApplicationNavigation({
        contextKind: "personal",
      })}
      user={{ displayName: "ユーザー" }}
      onSelectContext={() => undefined}
      onSelectNavigation={() => undefined}
      onCreateCommunity={() => undefined}
      onOpenSettings={() => undefined}
      onLogout={() => undefined}
    >
      <>
      <SettingsLayout section={section} onSectionChange={setSection}>
        {content}
      </SettingsLayout>
      <Text
        pos="absolute"
        style={{
          width: 1,
          height: 1,
          overflow: "hidden",
          clip: "rect(0 0 0 0)",
        }}
      >
        現在の設定: {currentLabel}
      </Text>
          </>
</PrototypeApplicationShell>
  )
}
