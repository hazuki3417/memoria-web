"use client"

import { Box, Button, Stack, TextInput } from "@mantine/core"
import { CommunityAliasSaveFeedback } from "./CommunityAliasSaveFeedback"
import type { useCommunityAliasForm, InspectCommunityAlias } from "./useCommunityAliasForm"

export type CommunityAliasSectionViewProps = {
  model: ReturnType<typeof useCommunityAliasForm>
  onInspect?: InspectCommunityAlias
}

/** Community別名の表示・編集・保存・Recovery操作を提供する。 */
export const CommunityAliasSectionView = ({ model, onInspect }: CommunityAliasSectionViewProps) => {
  const {
    field, fieldState, text, saving, blocked, unknown, validation,
    showClientError, changed, invalid, save, onAliasChange, saveLabel,
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
        disabled={saving}
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
          disabled={!changed || invalid || saving || unknown || blocked}
          onClick={() => void save()}
        >
          {saveLabel}
        </Button>
      </Box>
    </Stack>
  )
}
