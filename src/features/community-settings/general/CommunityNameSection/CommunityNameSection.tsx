"use client"

import { Box, Button, Stack, TextInput } from "@mantine/core"
import { SectionHeader } from "@/components/SectionHeader"
import { CommunityNameSaveFeedback } from "./CommunityNameSaveFeedback"
import { useCommunityNameSettings } from "./useCommunityNameSettings"
import type { SaveCommunityName } from "../communityNameSaveOutcome"

export type CommunityNameSectionProps = {
  isAdmin: boolean
  communityName?: string
  onSaveName?: SaveCommunityName
  onInspectName?: () => Promise<string>
}

const localSave: SaveCommunityName = async (name) => ({ kind: "success", value: name })

/** Community名の編集・保存・復旧UIを提供し、管理者以外の更新を禁止する。 */
export const CommunityNameSection = ({
  isAdmin,
  communityName = "家族のアルバム",
  onSaveName = localSave,
  onInspectName,
}: CommunityNameSectionProps) => {
  const form = useCommunityNameSettings({
    initialName: communityName,
    onSave: onSaveName,
    onInspect: onInspectName,
  })
  const { field, fieldState, validation } = form
  const error =
    fieldState.error?.type === "server"
      ? fieldState.error.message
      : form.showClientError && !validation.success
        ? validation.error.issues[0]?.message
        : undefined

  return (
    <Box>
      <SectionHeader>基本情報</SectionHeader>
      <Stack gap="md" maw={540}>
        <CommunityNameSaveFeedback model={form} onInspect={onInspectName} />
        <TextInput
          label="Community名"
          name={field.name}
          ref={field.ref}
          value={field.value}
          onChange={form.onDraftChange}
          onBlur={field.onBlur}
          error={error}
          disabled={!isAdmin || form.saving || form.blocked}
          required
        />
        {isAdmin && (
          <Box>
            <Button
              size="sm"
              disabled={!form.dirty || form.invalid || form.saving || form.blocked || form.unknown}
              loading={form.saving}
              onClick={() => void form.save()}
            >
              {form.saveLabel}
            </Button>
          </Box>
        )}
      </Stack>
    </Box>
  )
}
