"use client"
import { Box, Button, Stack, TextInput } from "@mantine/core"
import type { Dispatch, SetStateAction } from "react"
import { SectionHeader } from "@/components/SectionHeader"
export type CommunityNameSectionProps = { isAdmin: boolean; draft: string; setDraft: Dispatch<SetStateAction<string>>; invalid: boolean; dirty: boolean; savingName: boolean; saveName: () => void }
export function CommunityNameSection({ isAdmin, draft, setDraft, invalid, dirty, savingName, saveName }: CommunityNameSectionProps) {
  return (
    <>
      <Box>
        <SectionHeader>基本情報</SectionHeader>
        <Stack gap="md" maw={540}>
          <TextInput
            label="Community名"
            value={draft}
            onChange={(event) => setDraft(event.currentTarget.value)}
            error={invalid ? "Community名を入力してください" : undefined}
            disabled={!isAdmin}
            required
          />
          {isAdmin && (
            <Box>
              <Button
                size="sm"
                disabled={!dirty || invalid || savingName}
                loading={savingName}
                onClick={saveName}
              >
                保存
              </Button>
            </Box>
          )}
        </Stack>
      </Box>

    </>
  )
}
