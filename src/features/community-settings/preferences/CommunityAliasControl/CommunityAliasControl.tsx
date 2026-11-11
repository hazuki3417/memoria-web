"use client"

import { Box, Button, Stack, TextInput } from "@mantine/core"
import { useCommunityAliasForm } from "./useCommunityAliasForm"
import { CommunityAliasSaveFeedback } from "./CommunityAliasSaveFeedback"
import type { SaveActionResult } from "@/ui/SaveAction"

export function CommunityAliasControl({
  savedAlias,
  onSave,
  onInspect,
}: {
  savedAlias: string | null
  onSave: (alias: string | null) => Promise<SaveActionResult<string | null>>
  onInspect?: () => Promise<string | null>
}) {
  const model = useCommunityAliasForm({ savedAlias, onSave, onInspect })
  const {
    field, fieldState, text, saving, isInputDisabled, validation,
    showClientError, canSubmit, save, onAliasChange,
  } = model

  return (
    <Stack gap="md" maw={540}>
      <TextInput
        label="Community別名"
        description="自分だけに表示される名前です。空欄で保存すると正式名称が表示されます。"
        aria-label="Community別名"
        placeholder="別名を入力"
        name={field.name}
        ref={field.ref}
        onBlur={field.onBlur}
        value={text}
        disabled={isInputDisabled}
        onChange={onAliasChange}
        error={
          fieldState.error?.type === "server"
            ? fieldState.error.message
            : showClientError && !validation.success
              ? validation.error.issues[0]?.message
              : undefined
        }
      />
      <CommunityAliasSaveFeedback model={model} onInspect={onInspect} />
      <Box>
        <Button
          size="sm"
          loading={saving}
          disabled={!canSubmit}
          onClick={() => void save()}
        >
          保存
        </Button>
      </Box>
    </Stack>
  )
}
