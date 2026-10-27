"use client"

import type { ReactNode } from "react"
import { Box } from "@mantine/core"
import { IconPhoto } from "@tabler/icons-react"
import { MediaGrid } from "./MediaGrid"
import { ErrorState } from "@/components/ErrorState"
import { LoadingState } from "@/components/LoadingState"
import { EmptyState } from "@/components/EmptyState"
import { LoadMoreSentinel } from "./LoadMoreSentinel"

type GroupDetailMediaContentProps = {
 selected: { mediaCount: number } | null
 mediaDetailState: "ready" | "loading" | "error"
 mediaItemsData?: Array<{ id: string; label: string; src: string | null }>
 onRetryGroupMedia?: () => Promise<void>
 onOpenMedia: (index: number) => void
 mediaPageFeedback: ReactNode
 onMediaEndVisible?: () => void
}
export function GroupDetailMediaContent({
  selected,
  mediaDetailState,
  mediaItemsData,
  onRetryGroupMedia,
  onOpenMedia: openMediaAt,
  mediaPageFeedback,
  onMediaEndVisible,
}: GroupDetailMediaContentProps) {
 return (
        <Box p="sm">
          {mediaDetailState === "loading" ? (
            <LoadingState message="Mediaを読み込んでいます" />
          ) : mediaDetailState === "error" ? (
            <ErrorState variant="full" title="GroupのMediaを取得できませんでした" description="最新のGroup情報を確認するため、再取得してください。" onRetry={() => void onRetryGroupMedia?.()} />
          ) : (selected?.mediaCount ?? 0) === 0 ? (
            <EmptyState
              icon={<IconPhoto size={24} />}
              title="Mediaがありません"
              description="このGroupまたはその下位Groupに分類されたMediaはありません。"
            />
          ) : (
            <>
              <MediaGrid onOpen={openMediaAt} items={mediaItemsData} />
              {mediaPageFeedback}
              {onMediaEndVisible && (
                <LoadMoreSentinel onVisible={onMediaEndVisible} />
              )}
            </>
          )}
        </Box>
 )
}
