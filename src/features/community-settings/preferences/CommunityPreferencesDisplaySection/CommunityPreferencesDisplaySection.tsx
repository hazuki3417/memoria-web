"use client"

import { Box, ColorInput, Stack, Text } from "@mantine/core"
import { useMediaQuery } from "@mantine/hooks"
import { SectionHeader } from "@/components/SectionHeader"
import { SettingRow } from "@/components/SettingRow"
import type { useCommunityPreferencesForm } from "../useCommunityPreferencesForm"

/** 表示Sectionは画面が所有するForm Modelを利用する。 */
export const CommunityPreferencesDisplaySection = ({
  model, isPreview, accentError,
}: {
  model: ReturnType<typeof useCommunityPreferencesForm>
  isPreview: boolean
  accentError?: string
}) => {
  const compact = useMediaQuery("(max-width: 48em)")
  const { field, fieldState, draftInvalid, onDraftChange } = model

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
            error={
              accentError ??
              (fieldState.isTouched &&
              draftInvalid
                ? "HEXカラーコード（#RRGGBB）を入力してください。"
                : undefined)
            }
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
