"use client"

import { Box, Button, Stack, TextInput } from "@mantine/core"
import { SectionHeader } from "@/components/SectionHeader"
import { CommunityNameSaveFeedback } from "./CommunityNameSaveFeedback"
import type { InspectCommunityName, useCommunityNameForm } from "./useCommunityNameForm"

export type CommunityNameViewProps = {
  isAdmin: boolean
  form: ReturnType<typeof useCommunityNameForm>
  onInspectName?: InspectCommunityName
}

/** Community名の表示と操作だけを担う。保存・検証・Recoveryの状態はSectionから受け取る。 */
export const CommunityNameView = ({ isAdmin, form, onInspectName }: CommunityNameViewProps) => {
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
