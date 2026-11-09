"use client"

import { Box, Button, Stack, TextInput } from "@mantine/core"
import { SectionHeader } from "@/components/SectionHeader"
import { CommunityNameSaveFeedback } from "./CommunityNameSaveFeedback"
import { useCommunityNameSettings } from "./useCommunityNameSettings"

export type CommunityNameSectionProps = {
  isAdmin: boolean
  communityName?: string
  onSaveName?: (name: string) => Promise<string>
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
    invalid,
    dirty,
    savingName,
    saveName,
    fieldError,
    onNameBlur,
    saveFeedback,
    saveBlocked,
    unknown,
    inspection,
    inspectName,
    confirmObservation,
    discardUnconfirmed,
    canResaveInspected,
  } = useCommunityNameSettings({ communityName, onSaveName, onInspectName })

  return (
    <Box>
      <SectionHeader>基本情報</SectionHeader>
      <Stack gap="md" maw={540}>
        <CommunityNameSaveFeedback
          saveFeedback={saveFeedback}
          unknown={unknown}
          inspection={inspection}
          inspectName={inspectName}
          confirmObservation={confirmObservation}
          discardUnconfirmed={discardUnconfirmed}
          canResaveInspected={canResaveInspected}
          saveName={saveName}
        />
        <TextInput
          label="Community名"
          value={draft}
          onChange={(event) => setDraft(event.currentTarget.value)}
          onBlur={onNameBlur}
          error={fieldError}
          disabled={!isAdmin}
          required
        />
        {isAdmin && (
          <Box>
            <Button
              size="sm"
              disabled={!dirty || invalid || savingName || saveBlocked}
              loading={savingName}
              onClick={saveName}
            >
              保存
            </Button>
          </Box>
        )}
      </Stack>
    </Box>
  )
}
