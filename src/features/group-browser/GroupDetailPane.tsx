"use client"

import type { ReactNode, Ref } from "react"
import { Alert, Box, Button, Center, Divider, Group, Loader, ScrollArea, Stack, Text, ThemeIcon } from "@mantine/core"
import { IconEdit, IconPhoto, IconX } from "@tabler/icons-react"
import { MediaGrid } from "./MediaGrid"
import { LoadMoreSentinel } from "./LoadMoreSentinel"

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
  compact = false, selected, headingRef: compactDetailHeadingRef, mediaDetailState,
  mediaItemsData, onRetryGroupMedia, onOpenMedia: openMediaAt, mediaPageFeedback,
  onMediaEndVisible,
  relationCandidateFeedback, relationDetailSection, hideManagementActions,
  canManage, detailsReady, onEdit: openEdit, onClose: closeDetail,
}: GroupDetailPaneProps) {
  return compact ? (
            <Box h="100%" style={{ display: "flex", flexDirection: "column" }}>
              <Box
                pb="xs"
                style={{
                  display: "grid",
                  gridTemplateColumns: "minmax(0, 1fr) auto",
                  alignItems: "center",
                  gap: "var(--mantine-spacing-xs)",
                }}
              >
                <Group gap="xs" wrap="nowrap" style={{ minWidth: 0 }}>
                  <Text
                    fw={700}
                    truncate="end"
                    ref={compactDetailHeadingRef}
                    tabIndex={-1}
                  >
                    {selected?.name ?? ""}
                  </Text>
                </Group>
                <Button
                  size="xs"
                  variant="default"
                  leftSection={<IconX size={16} />}
                  onClick={closeDetail}
                >
                  一覧に戻る
                </Button>
              </Box>
              <Divider />
              {relationCandidateFeedback}
              {relationDetailSection}
              <Divider />
              <ScrollArea flex={1}>
                <Box p="sm">
                  {mediaDetailState === "loading" ? (
                    <Center mih={360}>
                      <Stack align="center">
                        <Loader />
                        <Text size="sm" c="dimmed">Mediaを読み込んでいます</Text>
                      </Stack>
                    </Center>
                  ) : mediaDetailState === "error" ? (
                    <Alert color="red" title="GroupのMediaを取得できませんでした">
                      <Stack gap="xs" align="flex-start">
                        <Text size="sm">最新のGroup情報を確認するため、再取得してください。</Text>
                        <Button size="xs" variant="light" onClick={() => void onRetryGroupMedia?.()}>
                          再試行
                        </Button>
                      </Stack>
                    </Alert>
                  ) : (selected?.mediaCount ?? 0) === 0 ? (
                    <Center mih={360}>
                      <Stack align="center" maw={420}>
                        <ThemeIcon size={48} radius="xl" variant="light">
                          <IconPhoto size={24} />
                        </ThemeIcon>
                        <Text fw={700} size="lg">Mediaがありません</Text>
                        <Text size="sm" c="dimmed" ta="center">
                          このGroupまたはその下位Groupに分類されたMediaはありません。
                        </Text>
                      </Stack>
                    </Center>
                  ) : (
                    <>
                      <MediaGrid onOpen={openMediaAt} items={mediaItemsData} />
                      {mediaPageFeedback}
                      {onMediaEndVisible && <LoadMoreSentinel onVisible={onMediaEndVisible} />}
                    </>
                  )}
                </Box>
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
                    <Box
                      pb="xs"
                      style={{
                        display: "grid",
                        gridTemplateColumns: "minmax(0, 1fr) auto",
                        alignItems: "center",
                        gap: "var(--mantine-spacing-xs)",
                      }}
                    >
                      <Group gap="xs" wrap="nowrap" style={{ minWidth: 0 }}>
                        <Text fw={700} truncate="end">
                          {selected?.name ?? ""}
                        </Text>
                      </Group>
                      <Group gap="xs" wrap="nowrap" justify="flex-end">
                        {!hideManagementActions && (
                        <Button
                          size="xs"
                          variant="default"
                          leftSection={<IconEdit size={16} />}
                          onClick={openEdit}
                          disabled={!canManage || !detailsReady}
                        >
                          編集
                        </Button>
                        )}
                        <Button
                          size="xs"
                          variant="default"
                          leftSection={<IconX size={16} />}
                          onClick={closeDetail}
                        >
                          閉じる
                        </Button>
                      </Group>
                    </Box>
                    <Divider />
                    {relationCandidateFeedback}

                    {relationDetailSection}
                    <Divider />

                    <ScrollArea flex={1}>
                      <Box p="sm">
                        {mediaDetailState === "loading" ? (
                          <Center mih={360}>
                      <Stack align="center">
                        <Loader />
                        <Text size="sm" c="dimmed">Mediaを読み込んでいます</Text>
                      </Stack>
                    </Center>
                        ) : mediaDetailState === "error" ? (
                          <Alert color="red" title="GroupのMediaを取得できませんでした">
                            <Stack gap="xs" align="flex-start">
                              <Text size="sm">最新のGroup情報を確認するため、再取得してください。</Text>
                              <Button size="xs" variant="light" onClick={() => void onRetryGroupMedia?.()}>
                                再試行
                              </Button>
                            </Stack>
                          </Alert>
                        ) : (selected?.mediaCount ?? 0) === 0 ? (
                          <Center mih={360}>
                            <Stack align="center" maw={420}>
                              <ThemeIcon size={48} radius="xl" variant="light">
                                <IconPhoto size={24} />
                              </ThemeIcon>
                              <Text fw={700} size="lg">Mediaがありません</Text>
                              <Text size="sm" c="dimmed" ta="center">
                                このGroupまたはその下位Groupに分類されたMediaはありません。
                              </Text>
                            </Stack>
                          </Center>
                        ) : (
                          <>
                            <MediaGrid
                              onOpen={openMediaAt}
                              items={mediaItemsData}
                            />
                            {mediaPageFeedback}
                      {onMediaEndVisible && <LoadMoreSentinel onVisible={onMediaEndVisible} />}
                          </>
                        )}
                      </Box>
                    </ScrollArea>
                  </Box>
  )
}
