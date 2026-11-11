"use client"

import { useState, type ReactNode } from "react"
import { Text } from "@mantine/core"
import { useMediaQuery } from "@mantine/hooks"
import {
  PersonalSettingsLayout,
  PersonalProfile,
  PersonalPreferences,
  Account,
  type PersonalSettingsSection,
} from "@/features/personal-settings"
import { UsageContent, type UsageScenario } from "./UsageContent"
import { getApplicationNavigation } from "@/features/application-shell"
import { PrototypeApplicationShell } from "@/prototypes/PrototypeApplicationShell"

type ProfileSaveState = "idle" | "saving" | "retryable-error" | "blocked"

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
  initialSection?: PersonalSettingsSection
  initialProfileSaveState?: ProfileSaveState
  initialUsageScenario?: UsageScenario
  initialUsageFileSizeUnit?: "DECIMAL" | "BINARY"
}) {
  const compact = useMediaQuery("(max-width: 48em)")
  const [section, setSection] = useState<PersonalSettingsSection>(initialSection)
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
        <PersonalProfile
          onSave={saveMockProfile}
          initialSaveState={initialProfileSaveState}
          blockedMessage="Userの状態が変わったため、この画面での変更を続けられません。ページを再読み込みして現在の状態を確認してください。"
        />
      )
      break
    case "preferences":
      content = <PersonalPreferences compact={compact} />
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
      content = <Account />
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
      <PersonalSettingsLayout section={section} onSectionChange={setSection}>
        {content}
      </PersonalSettingsLayout>
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
    </PrototypeApplicationShell>
  )
}
