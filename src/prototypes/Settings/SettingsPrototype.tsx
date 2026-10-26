"use client"

import { useState } from "react"
import { useMediaQuery } from "@mantine/hooks"
import { SettingsLayout, type Section } from "@/features/settings/SettingsLayout"
import { SettingsProfile } from "@/features/settings/SettingsProfile"
import { SettingsPreferences } from "@/features/settings/SettingsPreferences"
import { SettingsAccount } from "@/features/settings/SettingsAccount"
import { getApplicationNavigation } from "@/components/ApplicationShell"
import { FeedbackAlert, showNotification } from "@/components/Feedback"
import { NavigationItem } from "@/components/NavigationItem"
import { PageHeader } from "@/components/PageHeader"
import { SectionHeader } from "@/components/SectionHeader"
import { SettingRow } from "@/components/SettingRow"
import { SettingsUsage, type SettingsUsageData } from "@/features/settings"
import { PrototypeApplicationShell } from "@/prototypes/PrototypeApplicationShell"

type ProfileSaveState = "idle" | "saving" | "retryable-error" | "blocked"

const MOCK_PROFILE = { nickname: "ユーザー" }

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

function UsageContent({ initialScenario, fileSizeUnit }: { initialScenario: UsageScenario; fileSizeUnit: "DECIMAL" | "BINARY" }) {
  const [scenario, setScenario] = useState<UsageScenario | "retrying">(
    initialScenario === "retry-error" ? "error" : initialScenario,
  )
  const usage =
    scenario === "zero"
      ? ZERO_USAGE
      : scenario === "limit-reached"
        ? LIMIT_REACHED_USAGE
        : MOCK_USAGE
  const status =
    scenario === "loading" || scenario === "retrying"
      ? "loading"
      : (scenario === "error" || scenario === "error-no-retry")
        ? "error"
        : "ready"

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
  const currentLabel = ({ profile: "プロフィール", account: "アカウント", preferences: "環境設定", usage: "利用状況" } as const)[section]

  const content =
    section === "profile" ? (
      <SettingsProfile initialSaveState={initialProfileSaveState} blockedMessage="Userの状態が変わったため、この画面での変更を続けられません。ページを再読み込みして現在の状態を確認してください。" />
    ) : section === "preferences" ? (
      <SettingsPreferences compact={compact} />
    ) : section === "usage" ? (
      <UsageContent initialScenario={initialUsageScenario} fileSizeUnit={initialUsageFileSizeUnit} />
    ) : (
      <SettingsAccount deletionAction={<Button variant="default" size="sm">アカウントを削除する</Button>} />
    )

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
      <SettingsLayout section={section} onSectionChange={setSection}>
        {content}
      </SettingsLayout>
      <Text
        pos="absolute"
        style={{ width: 1, height: 1, overflow: "hidden", clip: "rect(0 0 0 0)" }}
      >
        現在の設定: {currentLabel}
      </Text>
      </Box>
    </PrototypeApplicationShell>
  )
}
