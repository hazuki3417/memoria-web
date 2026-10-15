"use client"

import { Box, Button, Collapse, Group, Stack, Text } from "@mantine/core"
import { IconChevronDown, IconPlus } from "@tabler/icons-react"
import type { ImageDetailViewerProps } from "../ImageDetailViewer/ImageDetailViewer"

type ImageDetailCommunitySectionProps = Pick<ImageDetailViewerProps, "detailValues" | "detailSectionsExpanded" | "toggleDetailSection" | "setUnshareTarget" | "setShareTarget" | "setDetailEditor" | "context">

export function ImageDetailCommunitySection({ detailValues, detailSectionsExpanded, toggleDetailSection, setUnshareTarget, setShareTarget, setDetailEditor, context: contextKind }: ImageDetailCommunitySectionProps) {
  return <>
                          {contextKind === "personal" ? (
                            <Box>
                              <Group
                                justify="space-between"
                                mb="sm"
                                wrap="nowrap"
                              >
                                <Group gap={6}>
                                  <Text size="xs" c="dimmed">
                                    共有先Community
                                  </Text>
                                  <Text size="xs" c="dimmed">
                                    ({detailValues.communities.length})
                                  </Text>
                                </Group>
                                <Button
                                  size="compact-xs"
                                  variant="subtle"
                                  leftSection={<IconPlus size={13} />}
                                  onClick={() => {
                                    setShareTarget(null)
                                    setDetailEditor("communities")
                                  }}
                                >
                                  共有
                                </Button>
                              </Group>
                              <Stack gap="xs">
                                {detailValues.communities.length === 0 ? (
                                  <Text size="xs" c="dimmed">
                                    未共有
                                  </Text>
                                ) : (
                                  detailValues.communities
                                    .slice(0, 3)
                                    .map((value) => (
                                      <Group
                                        key={value}
                                        justify="space-between"
                                        wrap="nowrap"
                                        mih={32}
                                        gap="xs"
                                      >
                                        <Box
                                          style={{
                                            minWidth: 0,
                                            flex: 1,
                                            overflowWrap: "anywhere",
                                          }}
                                        >
                                          <Text size="xs">{value}</Text>
                                        </Box>
                                        <Button
                                          size="compact-xs"
                                          variant="subtle"
                                          color="red"
                                          style={{ flexShrink: 0 }}
                                          onClick={() =>
                                            setUnshareTarget(value)
                                          }
                                        >
                                          共有解除
                                        </Button>
                                      </Group>
                                    ))
                                )}
                                {detailValues.communities.length > 3 && (
                                  <>
                                    <Collapse
                                      in={detailSectionsExpanded.communities}
                                      transitionDuration={200}
                                    >
                                      <Stack gap="xs">
                                        {detailValues.communities
                                          .slice(3)
                                          .map((value) => (
                                            <Group
                                              key={value}
                                              justify="space-between"
                                              wrap="nowrap"
                                              mih={32}
                                              gap="xs"
                                            >
                                              <Box
                                                style={{
                                                  minWidth: 0,
                                                  flex: 1,
                                                  overflowWrap: "anywhere",
                                                }}
                                              >
                                                <Text size="xs">{value}</Text>
                                              </Box>
                                              <Button
                                                size="compact-xs"
                                                variant="subtle"
                                                color="red"
                                                style={{ flexShrink: 0 }}
                                                onClick={() =>
                                                  setUnshareTarget(value)
                                                }
                                              >
                                                共有解除
                                              </Button>
                                            </Group>
                                          ))}
                                      </Stack>
                                    </Collapse>
                                    <Group justify="center">
                                      <Button
                                        size="compact-xs"
                                        variant="subtle"
                                        color="gray"
                                        fw={400}
                                        onClick={() =>
                                          toggleDetailSection("communities")
                                        }
                                        aria-expanded={
                                          detailSectionsExpanded.communities
                                        }
                                        rightSection={
                                          <IconChevronDown
                                            size={14}
                                            style={{
                                              transform:
                                                detailSectionsExpanded.communities
                                                  ? "rotate(180deg)"
                                                  : "rotate(0deg)",
                                              transition:
                                                "transform 200ms ease",
                                            }}
                                          />
                                        }
                                      >
                                        {detailSectionsExpanded.communities
                                          ? "折りたたむ"
                                          : `ほか${detailValues.communities.length - 3}件を表示`}
                                      </Button>
                                    </Group>
                                  </>
                                )}
                              </Stack>
                            </Box>
                          ) : (
                            <Group justify="space-between">
                              <Text size="xs" c="dimmed">
                                管理
                              </Text>
                              <Text size="xs">Community管理</Text>
                            </Group>
                          )}
  </>
}
