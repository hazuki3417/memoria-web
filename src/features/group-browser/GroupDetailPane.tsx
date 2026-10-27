"use client"

import type { ReactNode, Ref } from "react"
import { Box, Divider, ScrollArea } from "@mantine/core"
import { GroupDetailToolbar } from "./GroupDetailToolbar"
import { GroupDetailMediaContent } from "./GroupDetailMediaContent"

export type GroupDetailPaneProps = {
  compact?: boolean
  selected: { name: string; mediaCount: number } | null
  headingRef?: Ref<HTMLParagraphElement>
  mediaDetailState: "ready" | "loading" | "error"
  mediaItemsData?: Array<{ id: string; label: string; src: string | null }>
  onRetryGroupMedia?: () => Promise<void>
  onOpenMedia: (index: number) => void
  mediaPageFeedback: ReactNode
  onMediaEndVisible?: () => void
  relationCandidateFeedback: ReactNode
  relationDetailSection: ReactNode
  hideManagementActions: boolean
  canManage: boolean
  detailsReady: boolean
  onEdit: () => void
  onClose: () => void
}

/** Existing compact and wide detail layouts are preserved as separate variants. */
export function GroupDetailPane({
  compact = false,
  selected,
  headingRef: compactDetailHeadingRef,
  mediaDetailState,
  mediaItemsData,
  onRetryGroupMedia,
  onOpenMedia: openMediaAt,
  mediaPageFeedback,
  onMediaEndVisible,
  relationCandidateFeedback,
  relationDetailSection,
  hideManagementActions,
  canManage,
  detailsReady,
  onEdit: openEdit,
  onClose: closeDetail,
}: GroupDetailPaneProps) {
  return compact ? (
    <Box h="100%" style={{ display: "flex", flexDirection: "column" }}>
      <GroupDetailToolbar
        compact={compact}
        selected={selected}
        headingRef={compactDetailHeadingRef}
        hideManagementActions={hideManagementActions}
        canManage={canManage}
        detailsReady={detailsReady}
        onEdit={openEdit}
        onClose={closeDetail}
      />
      <Divider />
      {relationCandidateFeedback}
      {relationDetailSection}
      <Divider />
      <ScrollArea flex={1}>
      <GroupDetailMediaContent
        selected={selected}
        mediaDetailState={mediaDetailState}
        mediaItemsData={mediaItemsData}
        onRetryGroupMedia={onRetryGroupMedia}
        onOpenMedia={openMediaAt}
        mediaPageFeedback={mediaPageFeedback}
        onMediaEndVisible={onMediaEndVisible}
      />
      </ScrollArea>
    </Box>
  ) : (
    <Box
      style={{
        display: "flex",
        flexDirection: "column",
        minWidth: 0,
        minHeight: 0,
        height: "100%",
      }}
    >
      <GroupDetailToolbar
        compact={compact}
        selected={selected}
        headingRef={compactDetailHeadingRef}
        hideManagementActions={hideManagementActions}
        canManage={canManage}
        detailsReady={detailsReady}
        onEdit={openEdit}
        onClose={closeDetail}
      />
      <Divider />
      {relationCandidateFeedback}

      {relationDetailSection}
      <Divider />

      <ScrollArea flex={1}>
      <GroupDetailMediaContent
        selected={selected}
        mediaDetailState={mediaDetailState}
        mediaItemsData={mediaItemsData}
        onRetryGroupMedia={onRetryGroupMedia}
        onOpenMedia={openMediaAt}
        mediaPageFeedback={mediaPageFeedback}
        onMediaEndVisible={onMediaEndVisible}
      />
      </ScrollArea>
    </Box>
  )
}
