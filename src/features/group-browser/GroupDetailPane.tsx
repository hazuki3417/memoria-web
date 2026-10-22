"use client"

import type { ReactNode, Ref } from "react"
import { Alert, Box, Button, Center, Divider, Group, Loader, Paper, ScrollArea, Stack, Text } from "@mantine/core"
import { IconEdit, IconX } from "@tabler/icons-react"
import { MediaGrid } from "./MediaGrid"

export type GroupDetailPaneProps = {
  compact?: boolean
  selected: { name: string; mediaCount: number } | null
  headingRef?: Ref<HTMLParagraphElement>
  mediaDetailState: "ready" | "loading" | "error"
  mediaItemsData?: Array<{ id: string; label: string; src: string | null }>
  onRetryGroupMedia?: () => Promise<void>
  onOpenMedia: (index: number) => void
  mediaPageFeedback: ReactNode
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
                    <Center mih={180}><Loader /></Center>
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
                    <Paper withBorder p="xl" ta="center">
                      <Text fw={600}>Mediaがありません</Text>
                      <Text size="sm" c="dimmed" mt={4}>
                        このGroupまたはその下位Groupに分類されたMediaはありません。
                      </Text>
                    </Paper>
                  ) : (
                    <>
                      <MediaGrid onOpen={openMediaAt} items={mediaItemsData} />
                      {mediaPageFeedback}
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
                          <Center mih={180}><Loader /></Center>
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
                          <Paper withBorder p="xl" ta="center">
                            <Text fw={600}>Mediaがありません</Text>
                            <Text size="sm" c="dimmed" mt={4}>
                              このGroupまたはその下位Groupに分類されたMediaはありません。
                            </Text>
                          </Paper>
                        ) : (
                          <>
                            <MediaGrid
                              onOpen={openMediaAt}
                              items={mediaItemsData}
                            />
                            {mediaPageFeedback}
                          </>
                        )}
                      </Box>
                    </ScrollArea>
                  </Box>
  )
}
