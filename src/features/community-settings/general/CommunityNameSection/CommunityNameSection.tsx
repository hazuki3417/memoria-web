"use client"

import { Box, Button, Stack, TextInput } from "@mantine/core"
import type { Dispatch, SetStateAction } from "react"
import { SectionHeader } from "@/components/SectionHeader"
import { FeedbackPanel } from "@/components/Feedback"

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
  saveFeedback?: { title: string; description: string; kind?: "error" | "warning" } | null
  unknown?: boolean
  inspection?: { status: "idle" | "checking" | "failed" | "matches" | "differs" }
  inspectName?: () => Promise<void>
  confirmObservation?: () => void
  discardUnconfirmed?: () => void
  canResaveInspected?: boolean
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
  unknown = false,
  inspection,
  inspectName,
  confirmObservation,
  discardUnconfirmed,
  canResaveInspected = false,
}: CommunityNameSectionProps) {
  return (
    <Box>
      <SectionHeader>基本情報</SectionHeader>
      <Stack gap="md" maw={540}>
        {saveFeedback && (
          <FeedbackPanel
            kind={saveFeedback.kind ?? "error"}
            title={saveFeedback.title}
            role="alert"
            actions={
              unknown && inspectName ? (
                <>
                  <Button
                    size="xs"
                    variant="light"
                    loading={inspection?.status === "checking"}
                    onClick={() => void inspectName()}
                  >
                    {inspection?.status === "matches" || inspection?.status === "differs"
                      ? "もう一度確認"
                      : "現在の状態を確認"}
                  </Button>
                  {inspection?.status === "matches" && confirmObservation && (
                    <Button size="xs" onClick={confirmObservation}>
                      確認完了
                    </Button>
                  )}
                  {inspection?.status === "differs" && (
                    <>
                      <Button
                        size="xs"
                        disabled={!canResaveInspected}
                        onClick={saveName}
                      >
                        もう一度保存
                      </Button>
                      {discardUnconfirmed && (
                        <Button
                          size="xs"
                          variant="subtle"
                          color="gray"
                          onClick={discardUnconfirmed}
                        >
                          変更を破棄
                        </Button>
                      )}
                    </>
                  )}
                </>
              ) : undefined
            }
          >
            {saveFeedback.description}
          </FeedbackPanel>
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
