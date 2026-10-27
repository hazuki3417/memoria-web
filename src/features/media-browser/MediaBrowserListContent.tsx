"use client"

import { Alert, Box, Button, Center, Group, Loader, Paper, Stack, Text, ThemeIcon } from "@mantine/core"
import { IconAlertCircle, IconCloudUpload, IconPhoto, IconTags } from "@tabler/icons-react"
import type { MediaItem } from "@/features/media-detail"
import { MediaTile } from "./MediaTile"

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
              <Center mih={360}>
                <Stack align="center">
                  <Loader />
                  <Text size="sm" c="dimmed">
                    Mediaを読み込んでいます
                  </Text>
                </Stack>
              </Center>
            )}
            {activeState === "error" && (
              <Alert
                icon={<IconAlertCircle size={18} />}
                title="Mediaを読み込めませんでした"
                color="red"
              >
                <Group justify="space-between">
                  <Text size="sm">
                    通信状態を確認して、もう一度お試しください。
                  </Text>
                  <Button size="xs" variant="default" onClick={onRetry}>
                    再試行
                  </Button>
                </Group>
              </Alert>
            )}
            {activeState === "true-empty" && (
              <Center mih={360}>
                <Stack align="center" maw={420}>
                  <ThemeIcon size={48} radius="xl" variant="light">
                    <IconPhoto size={24} />
                  </ThemeIcon>
                  <Text fw={700} size="lg">
                    まだMediaがありません
                  </Text>
                  <Text size="sm" c="dimmed" ta="center">
                    {context === "personal"
                      ? "最初のMediaをアップロードすると、ここから閲覧・整理できます。"
                      : "CommunityへMediaを追加すると、ここから閲覧・整理できます。"}
                  </Text>
                  <Button
                    leftSection={<IconCloudUpload size={16} />}
                    onClick={
                      hasRemoteItems
                        ? () =>
                            navigate(
                              context === "personal"
                                ? "/media/upload"
                                : `/communities/${communityId}/media/upload`,
                            )
                        : undefined
                    }
                  >
                    {context === "personal"
                      ? "Mediaをアップロード"
                      : "Mediaを追加"}
                  </Button>
                </Stack>
              </Center>
            )}
            {activeState === "filtered-empty" && (
              <Center mih={360}>
                <Stack align="center" maw={420}>
                  <ThemeIcon size={48} radius="xl" variant="light" color="gray">
                    <IconTags size={24} />
                  </ThemeIcon>
                  <Text fw={700} size="lg">
                    一致するMediaがありません
                  </Text>
                  <Text size="sm" c="dimmed" ta="center">
                    選択中のTagを変更するか、filterを解除してください。
                  </Text>
                  <Button
                    variant="default"
                    onClick={onClearTags}
                  >
                    Filterを解除
                  </Button>
                </Stack>
              </Center>
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
              <Center py="md">
                <Group gap="xs">
                  <Loader size="sm" />
                  <Text size="sm" c="dimmed">
                    さらに読み込んでいます
                  </Text>
                </Group>
              </Center>
            )}
            {(loadMoreError || activeState === "load-more-error") && (
              <Paper withBorder radius="md" p="sm">
                <Group justify="space-between">
                  <Group gap="xs">
                    <IconAlertCircle size={18} />
                    <Text size="sm">続きのMediaを読み込めませんでした</Text>
                  </Group>
                  <Button size="xs" variant="default" onClick={onLoadMore}>
                    再試行
                  </Button>
                </Group>
              </Paper>
            )}

 </>
}
