"use client"

import { Box, Button, Stack, TextInput } from "@mantine/core"
import { SectionHeader } from "@/components/SectionHeader"
import { CommunityNameSaveFeedback } from "./CommunityNameSaveFeedback"
import { useCommunityNameSettings } from "./useCommunityNameSettings"
import type { SaveActionResult } from "@/ui/SaveAction"

export type CommunityNameSectionProps = {
  isAdmin: boolean
  communityName?: string
  onSaveName?: (name: string) => Promise<SaveActionResult<string>>
  onInspectName?: () => Promise<string>
}

export function CommunityNameSection({
  isAdmin,
  communityName,
  onSaveName,
  onInspectName,
}: CommunityNameSectionProps) {
  const {
    draft,
    setDraft,
    canSubmit,
    isSaving,
    isInputDisabled,
    save,
    fieldError,
    onNameBlur,
    formInvalid,
    failure,
    blockedFeedback,
    inspection,
    inspect,
    confirmObservation,
    discardUnconfirmed,
    canResaveInspected,
  } = useCommunityNameSettings({ communityName, onSaveName, onInspectName })

  return (
    <Box>
      <SectionHeader>基本情報</SectionHeader>
      <Stack gap="md" maw={540}>
        <CommunityNameSaveFeedback
          formInvalid={formInvalid}
          failure={failure}
          blockedFeedback={blockedFeedback}
          draft={draft}
          inspection={inspection}
          inspect={inspect}
          confirmObservation={confirmObservation}
          discardUnconfirmed={discardUnconfirmed}
          canResaveInspected={canResaveInspected}
          save={save}
        />
        <TextInput
          label="Community名"
          value={draft}
          onChange={(event) => setDraft(event.currentTarget.value)}
          onBlur={onNameBlur}
          error={fieldError}
          disabled={!isAdmin || isInputDisabled}
          required
        />
        {isAdmin && (
          <Box>
            <Button
              size="sm"
              disabled={!canSubmit}
              loading={isSaving}
              onClick={() => void save()}
            >
              保存
            </Button>
          </Box>
        )}
      </Stack>
    </Box>
  )
}
