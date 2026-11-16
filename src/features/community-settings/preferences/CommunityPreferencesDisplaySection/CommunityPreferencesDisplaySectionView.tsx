"use client"

import { Box, ColorInput, Stack, Text } from "@mantine/core"
import { SectionHeader } from "@/components/SectionHeader"
import { SettingRow } from "@/components/SettingRow"
import type { CommunityPreferencesDisplaySectionModel } from "./useCommunityPreferencesDisplaySection"

/** 表示Sectionの入力UI。Formと保存の状態は所有しない。 */
export const CommunityPreferencesDisplaySectionView = ({
  model,
  isPreview,
}: {
  model: CommunityPreferencesDisplaySectionModel
  isPreview: boolean
}) => {
  const { compact, field, error, onDraftChange } = model

  return (
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
            error={error}
            format="hex"
            name={field.name}
            ref={field.ref}
            onBlur={field.onBlur}
            value={field.value}
            onChange={onDraftChange}
          />
        </SettingRow>
        {isPreview && (
          <Text size="sm" c="dimmed">
            色の選択はプレビューです。保存・Contextへの反映はまだ行われません。
          </Text>
        )}
      </Stack>
    </Box>
  )
}
