"use client"

import type { RefObject } from "react"
import { Box, Button, Center, Loader, Stack, Text, ThemeIcon, UnstyledButton } from "@mantine/core"
import { IconFolderPlus, IconSearch } from "@tabler/icons-react"
import { GroupPreviewGrid as PreviewGrid } from "./GroupPreviewGrid"
import { LoadMoreSentinel } from "./LoadMoreSentinel"
import { ErrorState } from "@/components/ErrorState"
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
      <Center mih={360}>
        <Stack align="center" maw={420}>
          <ThemeIcon size={48} radius="xl" variant="light">
            <IconFolderPlus size={24} />
          </ThemeIcon>
          <Text fw={700} size="lg">
            まだGroupがありません
          </Text>
          <Text size="sm" c="dimmed" ta="center">
            最初のGroupを作成すると、ここからMediaを整理できます。
          </Text>
          {!hideManagementActions && (
            <Button
              leftSection={<IconFolderPlus size={16} />}
              onClick={onCreate}
              disabled={!canManage}
            >
              Groupを作成
            </Button>
          )}
        </Stack>
      </Center>
    ) : null

  const discoveryFeedback =
    discoveryState === "loading" ? (
      <Center mih={360}>
        <Stack align="center">
          <Loader />
          <Text size="sm" c="dimmed">
            Groupを読み込んでいます
          </Text>
        </Stack>
      </Center>
    ) : discoveryState === "error" ? (
      <Box p="sm">
        <ErrorState variant="full" title="Group一覧を取得できませんでした" description="Group一覧の取得に失敗しました。再試行できます。" onRetry={onRetryDiscovery} />
      </Box>
    ) : null
  const discoveryPageFeedback =
    discoveryPageState === "loading" ? (
      <Center py="lg">
        <Stack align="center" gap={6}>
          <Loader size="sm" />
          <Text size="xs" c="dimmed">
            追加のGroupを取得しています
          </Text>
        </Stack>
      </Center>
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
      <Center mih={360}>
        <Stack align="center" maw={420}>
          <ThemeIcon size={48} radius="xl" variant="light" color="gray">
            <IconSearch size={24} />
          </ThemeIcon>
          <Text fw={700} size="lg">
            一致するGroupがありません
          </Text>
          <Text size="sm" c="dimmed" ta="center">
            検索条件を変更するか、検索を解除してください。
          </Text>
          <Button
            variant="default"
            onClick={() => {
              onClearSearch()
            }}
          >
            検索を解除
          </Button>
        </Stack>
      </Center>
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
