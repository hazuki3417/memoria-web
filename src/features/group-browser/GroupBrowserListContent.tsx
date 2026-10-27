"use client"

import type { ReactNode, RefObject } from "react"
import { Box, Stack, Text, UnstyledButton } from "@mantine/core"
import { GroupPreviewGrid as PreviewGrid } from "./GroupPreviewGrid"
import { LoadMoreSentinel } from "./LoadMoreSentinel"
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
 discoveryFeedback: ReactNode
 emptyGroupState: ReactNode
 searchEmptyState: ReactNode
 discoveryPageFeedback: ReactNode
 discoveryPageState: "idle" | "loading" | "error"
 onDiscoveryEndVisible?: () => void
}

export function GroupBrowserListContent({compact,visibleGroups,discoveryState,groupsLoaded,selectedId,mediaItemsData,compactGroupItemRefs,onOpenDetail:openDetail,discoveryFeedback,emptyGroupState,searchEmptyState,discoveryPageFeedback,discoveryPageState,onDiscoveryEndVisible}:GroupBrowserListContentProps) {
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
