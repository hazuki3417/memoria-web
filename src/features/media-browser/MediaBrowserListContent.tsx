"use client"

import { Box, Button, Center } from "@mantine/core"
import { IconCloudUpload } from "@tabler/icons-react"
import type { MediaItem } from "@/features/media-detail"
import { MediaTile } from "./MediaTile"
import { ErrorState } from "@/components/ErrorState"
import { LoadingState } from "@/components/LoadingState"
import { EmptyState } from "@/components/EmptyState"

export type MediaBrowserListState = "default" | "tag-filtered" | "true-empty" | "filtered-empty" | "loading" | "error" | "loading-more" | "load-more-error" | "processing-failure" | "selection"

type MediaBrowserListContentProps = {
 activeState: MediaBrowserListState
 context: "personal" | "community"
 communityId: string
 items: MediaItem[]
 hasRemoteItems: boolean
 selecting: boolean
 selected: Set<string>
 onToggle: (id: string) => void
 onOpenDetail: (item: MediaItem) => void
 navigate: (path: string) => void
 onClearTags: () => void
 onRetry?: () => void
 onLoadMore?: () => void
 hasMore: boolean
 loadingMore: boolean
 loadMoreError: boolean
}

export function MediaBrowserListContent({ activeState, context, communityId, items: stateItems, hasRemoteItems, selecting, selected, onToggle: toggle, onOpenDetail, navigate, onClearTags, onRetry, onLoadMore, hasMore, loadingMore, loadMoreError }: MediaBrowserListContentProps) {
 return <>
            {activeState === "loading" && (
              <LoadingState title="Mediaを読み込んでいます" />
            )}
            {activeState === "error" && (
              <ErrorState variant="full" title="Mediaを読み込めませんでした" description="通信状態を確認して、もう一度お試しください。" onRetry={onRetry} />
            )}
            {activeState === "true-empty" && (
              <EmptyState
                kind="media"
                title="まだMediaがありません"
                description={context === "personal"
                  ? "最初のMediaをアップロードすると、ここから閲覧・整理できます。"
                  : "CommunityへMediaを追加すると、ここから閲覧・整理できます。"}
                action={
                  <Button
                    leftSection={<IconCloudUpload size={16} />}
                    onClick={hasRemoteItems
                      ? () => navigate(context === "personal"
                        ? "/media/upload"
                        : `/communities/${communityId}/media/upload`)
                      : undefined}
                  >
                    {context === "personal" ? "Mediaをアップロード" : "Mediaを追加"}
                  </Button>
                }
              />
            )}
            {activeState === "filtered-empty" && (
              <EmptyState
                kind="tags"
                title="一致するMediaがありません"
                description="選択中のTagを変更するか、filterを解除してください。"
                action={<Button variant="default" onClick={onClearTags}>Filterを解除</Button>}
              />
            )}

            {activeState !== "error" &&
              activeState !== "loading" &&
              stateItems.length > 0 && (
                <Box
                  p={3}
                  style={{
                    display: "grid",
                    gridTemplateColumns:
                      "repeat(auto-fill, minmax(min(168px, 100%), 1fr))",
                    gap: "var(--mantine-spacing-xs)",
                  }}
                >
                  {stateItems.map((item) => (
                    <MediaTile
                      key={item.id}
                      item={item}
                      selecting={selecting}
                      selected={selected.has(item.id)}
                      onClick={() => {
                        if (selecting) {
                          toggle(item.id)
                          return
                        }
                        if (!hasRemoteItems) onOpenDetail(item)
                      }}
                    />
                  ))}
                </Box>
              )}
            {activeState !== "error" &&
              hasMore &&
              !loadingMore &&
              !loadMoreError && (
                <Center py="md">
                  <Button size="xs" variant="default" onClick={onLoadMore}>
                    さらに読み込む
                  </Button>
                </Center>
              )}
            {(loadingMore || activeState === "loading-more") && (
              <LoadingState variant="inline" title="さらに読み込んでいます" />
            )}
            {(loadMoreError || activeState === "load-more-error") && (
              <Box p="sm">
                <ErrorState variant="inline" title="続きのMediaを読み込めませんでした" onRetry={onLoadMore} />
              </Box>
            )}

 </>
}
