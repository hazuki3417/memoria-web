"use client"

import { Box, Button, Stack, TextInput } from "@mantine/core"
import type { Dispatch, SetStateAction } from "react"
import { SectionHeader } from "@/components/SectionHeader"
import { FeedbackAlert } from "@/components/Feedback"

export type CommunityNameSectionProps = {
  isAdmin: boolean
  draft: string
  setDraft: Dispatch<SetStateAction<string>>
  invalid: boolean
  dirty: boolean
  savingName: boolean
  saveName: () => void
  fieldError?: string
  onNameBlur?: () => void
  saveFeedback?: { title: string; description: string } | null
  saveBlocked?: boolean
}

export function CommunityNameSection({
  isAdmin,
  draft,
  setDraft,
  invalid,
  dirty,
  savingName,
  saveName,
  fieldError,
  onNameBlur,
  saveFeedback,
  saveBlocked = false,
}: CommunityNameSectionProps) {
  return (
    <Box>
      <SectionHeader>基本情報</SectionHeader>
      <Stack gap="md" maw={540}>
        {saveFeedback && (
          <FeedbackAlert kind="error" title={saveFeedback.title} role="alert">
            {saveFeedback.description}
          </FeedbackAlert>
        )}
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
