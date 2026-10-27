"use client"

import { Box, Group, Stack, Text } from "@mantine/core"
import type { Dispatch, SetStateAction } from "react"
import { PageHeader } from "@/components/PageHeader"
import { SectionHeader } from "@/components/SectionHeader"

export function CommunityPreferencesContent({
  accent,
  setAccent,
}: {
  accent: string
  setAccent: Dispatch<SetStateAction<string>>
}) {
  return (
    <Stack gap="xl">
      <PageHeader
        title="環境設定"
        description="このCommunityでの自分専用の表示設定です。他のメンバーには影響しません。"
      />
      <Box>
        <SectionHeader>アクセントカラー</SectionHeader>
        <Stack gap="sm" maw={540}>
          <Text size="sm" c="dimmed">
            色の選択はプレビューです。保存・Contextへの反映はまだ行われません。
          </Text>
          <Group gap="sm">
            <input
              type="color"
              aria-label="Communityアクセントカラー"
              value={accent}
              onChange={(event) => setAccent(event.currentTarget.value)}
            />
            <Text size="sm">{accent.toUpperCase()}</Text>
          </Group>
        </Stack>
      </Box>
    </Stack>
  )
}
