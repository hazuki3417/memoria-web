"use client"

import { useEffect, useState, type Dispatch, type SetStateAction } from "react"
import { Box, ColorInput, Stack, Text } from "@mantine/core"
import { useMediaQuery } from "@mantine/hooks"
import { PageHeader } from "@/components/PageHeader"
import { SectionHeader } from "@/components/SectionHeader"
import { SettingRow } from "@/components/SettingRow"

const isHex = (value: string) => /^#[0-9a-fA-F]{6}$/.test(value)

export function CommunityPreferencesContent({
  accent,
  setAccent,
  isPreview = true,
}: {
  accent: string
  setAccent: Dispatch<SetStateAction<string>>
  isPreview?: boolean
}) {
  const compact = useMediaQuery("(max-width: 48em)")
  const [draft, setDraft] = useState(accent)

  // Preserve partially typed values without submitting an invalid color.
  // Update the input when a saved value or a rollback arrives from the parent.
  useEffect(() => {
    setDraft(accent)
  }, [accent])

  return (
    <Stack gap="xl">
      <PageHeader
        title="環境設定"
        description="このCommunityでの自分専用の表示設定です。他のメンバーには影響しません。"
      />
      <Box>
        <SectionHeader>表示</SectionHeader>
        <Stack gap="xl">
          <SettingRow
            compact={compact}
            label="Community Accent Color"
            description="このCommunityで使用するアクセントカラーを選びます。"
          >
            <ColorInput
              aria-label="Communityアクセントカラー"
              format="hex"
              value={draft}
              onChange={(next) => {
                setDraft(next)
                if (isHex(next)) setAccent(next)
              }}
            />
          </SettingRow>
          <Text size="sm" c="dimmed">
            {isPreview
              ? "色の選択はプレビューです。保存・Contextへの反映はまだ行われません。"
              : "選んだ色は自分のCommunity設定に自動保存されます。"}
          </Text>
        </Stack>
      </Box>
    </Stack>
  )
}
