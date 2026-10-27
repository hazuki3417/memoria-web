"use client"

import type { RefObject } from "react"
import { Box, Button, Stack, Text, UnstyledButton } from "@mantine/core"
import { IconFolderPlus, IconSearch } from "@tabler/icons-react"
import { GroupPreviewGrid as PreviewGrid } from "./GroupPreviewGrid"
import { LoadMoreSentinel } from "./LoadMoreSentinel"
import { ErrorState } from "@/components/ErrorState"
import { LoadingState } from "@/components/LoadingState"
import { EmptyState } from "@/components/EmptyState"
import type { GroupBrowserGroup } from "./GroupBrowser"

type GroupBrowserListContentProps = {
 compact: boolean
 visibleGroups: GroupBrowserGroup[]
 discoveryState: "ready" | "loading" | "error"
 groupsLoaded: boolean
 selectedId: string | null
 mediaItemsData?: Array<{ id: string; label: string; src: string | null }>
 compactGroupItemRefs: RefObject<Map<string, HTMLButtonElement>>
 onOpenDetail: (id: string) => void
 groupCount: number
 appliedQuery: string
 hideManagementActions: boolean
 canManage: boolean
 onCreate: () => void
 onClearSearch: () => void
 onRetryDiscovery?: () => void
 onRetryDiscoveryPage?: () => void
 discoveryPageState: "idle" | "loading" | "error"
 onDiscoveryEndVisible?: () => void
}

export function GroupBrowserListContent({
  compact,
  visibleGroups,
  discoveryState,
  groupsLoaded,
  selectedId,
  mediaItemsData,
  compactGroupItemRefs,
  onOpenDetail: openDetail,
  groupCount,
  appliedQuery,
  hideManagementActions,
  canManage,
  onCreate,
  onClearSearch,
  onRetryDiscovery,
  onRetryDiscoveryPage,
  discoveryPageState,
  onDiscoveryEndVisible,
}: GroupBrowserListContentProps) {
  const emptyGroupState =
    discoveryState === "ready" &&
    groupCount === 0 &&
    !appliedQuery.trim() ? (
      <EmptyState
        icon={<IconFolderPlus size={24} />}
        title="まだGroupがありません"
        description="最初のGroupを作成すると、ここからMediaを整理できます。"
        action={!hideManagementActions ? (
          <Button
            leftSection={<IconFolderPlus size={16} />}
            onClick={onCreate}
            disabled={!canManage}
          >
            Groupを作成
          </Button>
        ) : undefined}
      />
    ) : null

  const discoveryFeedback =
    discoveryState === "loading" ? (
      <LoadingState title="Groupを読み込んでいます" />
    ) : discoveryState === "error" ? (
      <Box p="sm">
        <ErrorState variant="full" title="Group一覧を取得できませんでした" description="Group一覧の取得に失敗しました。再試行できます。" onRetry={onRetryDiscovery} />
      </Box>
    ) : null
  const discoveryPageFeedback =
    discoveryPageState === "loading" ? (
      <LoadingState variant="inline" inlinePadding="lg" inlineGap={6} title="追加のGroupを取得しています" />
    ) : discoveryPageState === "error" ? (
      <Box p="sm">
        <ErrorState variant="inline" title="追加のGroupを取得できませんでした" onRetry={onRetryDiscoveryPage} />
      </Box>
    ) : null
  const searchEmptyState =
    discoveryState === "ready" &&
    groupCount > 0 &&
    visibleGroups.length === 0 &&
    appliedQuery.trim() ? (
      <EmptyState
        icon={<IconSearch size={24} />}
        iconColor="gray"
        title="一致するGroupがありません"
        description="検索条件を変更するか、検索を解除してください。"
        action={<Button variant="default" onClick={onClearSearch}>検索を解除</Button>}
      />
    ) : null

 return <>
 {compact ? (<>

                {discoveryFeedback}
                {emptyGroupState}
                {searchEmptyState}
                <Box
                  p="sm"
                  style={{
                    display: "flex",
                    flexWrap: "wrap",
                    gap: "var(--mantine-spacing-sm)",
                  }}
                >
                  {(discoveryState === "ready" ? visibleGroups : []).map(
                    (group) => (
                      <UnstyledButton
                        key={group.id}
                        ref={(element) => {
                          if (element)
                            compactGroupItemRefs.current.set(group.id, element)
                          else compactGroupItemRefs.current.delete(group.id)
                        }}
                        onClick={() => openDetail(group.id)}
                        p="xs"
                        bdrs="sm"
                        w={240}
                      >
                        <Stack gap={6}>
                          <Text
                            fw={600}
                            size="sm"
                            truncate="end"
                            title={group.name}
                          >
                            {group.name}
                          </Text>
                          <PreviewGrid
                            count={group.previewCount}
                            remote={groupsLoaded}
                            sources={
                              group.id === selectedId
                                ? (mediaItemsData ?? []).flatMap((item) =>
                                    item.src ? [item.src] : [],
                                  )
                                : []
                            }
                          />
                        </Stack>
                      </UnstyledButton>
                    ),
                  )}
                </Box>
                {discoveryPageFeedback}
                {onDiscoveryEndVisible && discoveryPageState !== "error" && (
                  <LoadMoreSentinel onVisible={onDiscoveryEndVisible} />
                )}

 </>) : (<>

                {discoveryFeedback}
                {emptyGroupState}
                {searchEmptyState}
                <Box
                  p="sm"
                  style={{
                    display: "flex",
                    flexWrap: "wrap",
                    gap: "var(--mantine-spacing-sm)",
                  }}
                >
                  {(discoveryState === "ready" ? visibleGroups : []).map(
                    (group) => {
                      const selectedItem = group.id === selectedId
                      return (
                        <UnstyledButton
                          key={group.id}
                          onClick={() => openDetail(group.id)}
                          aria-pressed={selectedItem}
                          w={240}
                          p="xs"
                          bdrs="sm"
                          bg={
                            selectedItem
                              ? "var(--mantine-color-default-hover)"
                              : undefined
                          }
                          style={{
                            border: selectedItem
                              ? "1px solid var(--mantine-primary-color-filled)"
                              : "1px solid transparent",
                          }}
                        >
                          <Stack gap={6}>
                            <Text
                              fw={600}
                              size="sm"
                              truncate="end"
                              title={group.name}
                            >
                              {group.name}
                            </Text>
                            <PreviewGrid
                              count={group.previewCount}
                              remote={groupsLoaded}
                            />
                          </Stack>
                        </UnstyledButton>
                      )
                    },
                  )}
                </Box>
                {discoveryPageFeedback}
                {onDiscoveryEndVisible && discoveryPageState !== "error" && (
                  <LoadMoreSentinel onVisible={onDiscoveryEndVisible} />
                )}

 </>)}
 </>
}
