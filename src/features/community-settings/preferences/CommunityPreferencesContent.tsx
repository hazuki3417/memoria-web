"use client"

import type { ComponentProps, ReactNode } from "react"
import { Box, Stack } from "@mantine/core"
import { PageHeader } from "@/components/PageHeader"
import { SaveStatus, SETTINGS_SAVE_STATUS_TIMING } from "@/components/SaveStatus"
import { SectionHeader } from "@/components/SectionHeader"
import { CommunityPreferencesDisplaySection } from "./CommunityPreferencesDisplaySection/CommunityPreferencesDisplaySection"
import { CommunityAliasSection } from "./CommunityAliasSection"
import { CommunityPreferencesSaveFeedback } from "./CommunityPreferencesSaveFeedback"
import type { useCommunityPreferencesForm } from "./useCommunityPreferencesForm"

type PreferencesModel = ReturnType<typeof useCommunityPreferencesForm>

/**
 * Production / Story / Prototypeで同じVisual Compositionを共有する。
 * 保存・Query・PreviewのSource選択は呼び出し元とFormが所有する。
 */
export const CommunityPreferencesContent = ({
  model,
  aliasSection,
  alias,
  isPreview,
  saveFeedback,
  accentError,
  productionLayout,
}: {
  model: PreferencesModel
  aliasSection?: ReactNode
  alias?: ComponentProps<typeof CommunityAliasSection>
  isPreview: boolean
  saveFeedback?: ReactNode
  accentError?: string
  productionLayout: boolean
}) => {
  const aliasContent = alias ? <CommunityAliasSection {...alias} /> : aliasSection
  const content = (
    <Stack gap="xl">
      <PageHeader
        title="環境設定"
        description="このCommunityでの自分専用の表示設定です。他のメンバーには影響しません。"
        titleAccessory={
          model.saveStatus !== undefined ? (
            <SaveStatus
              state={model.saveStatus}
              announce
              timing={SETTINGS_SAVE_STATUS_TIMING}
            />
          ) : undefined
        }
      />
      {saveFeedback ?? <CommunityPreferencesSaveFeedback model={model} />}
      {aliasContent && (
        <Box>
          <SectionHeader>表示名</SectionHeader>
          {aliasContent}
        </Box>
      )}
      <CommunityPreferencesDisplaySection
        model={model}
        isPreview={isPreview}
        accentError={accentError ?? model.snapshot.validation?.fieldErrors.accentColor}
      />
    </Stack>
  )
  // Productionの既存外側Stackを維持し、Preview Storyの外側構造を変更しない。
  return productionLayout ? <Stack gap="sm">{content}</Stack> : content
}
