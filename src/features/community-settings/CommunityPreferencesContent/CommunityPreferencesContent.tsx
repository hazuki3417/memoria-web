"use client"

import {
  useEffect,
  type Dispatch,
  type ReactNode,
  type SetStateAction,
} from "react"
import { useController, useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import type { z } from "zod"
import { communityAccentSchema } from "../communityAccentSchema"
import { Box, ColorInput, Stack, Text } from "@mantine/core"
import { useMediaQuery } from "@mantine/hooks"
import { PageHeader } from "@/components/PageHeader"
import { SectionHeader } from "@/components/SectionHeader"
import { SettingRow } from "@/components/SettingRow"

export function CommunityPreferencesContent({
  accent,
  setAccent,
  isPreview = true,
  aliasControl,
}: {
  accent: string
  setAccent: Dispatch<SetStateAction<string>>
  isPreview?: boolean
  aliasControl?: ReactNode
}) {
  const compact = useMediaQuery("(max-width: 48em)")
  const { control, reset } = useForm<z.input<typeof communityAccentSchema>>({
    resolver: zodResolver(communityAccentSchema),
    mode: "onChange",
    defaultValues: { accentDraft: accent },
  })
  const { field } = useController({ control, name: "accentDraft" })

  // Preserve partially typed values without submitting an invalid color.
  // Update the input when a saved value or a rollback arrives from the parent.
  useEffect(() => {
    reset({ accentDraft: accent })
  }, [accent, reset])

  return (
    <Stack gap="xl">
      <PageHeader
        title="環境設定"
        description="このCommunityでの自分専用の表示設定です。他のメンバーには影響しません。"
      />
      {aliasControl && (
        <Box>
          <SectionHeader>表示名</SectionHeader>
          {aliasControl}
        </Box>
      )}
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
              name={field.name}
              ref={field.ref}
              onBlur={field.onBlur}
              value={field.value}
              onChange={(next) => {
                field.onChange(next)
                const parsed = communityAccentSchema.safeParse({ accentDraft: next })
                if (parsed.success) setAccent(parsed.data.accentDraft)
              }}
            />
          </SettingRow>
          {isPreview && (
            <Text size="sm" c="dimmed">
              色の選択はプレビューです。保存・Contextへの反映はまだ行われません。
            </Text>
          )}
        </Stack>
      </Box>
    </Stack>
  )
}
