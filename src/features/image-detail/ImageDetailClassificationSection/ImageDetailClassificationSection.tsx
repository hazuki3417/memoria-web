"use client"

import { Badge, Box, Button, Collapse, Divider, Group, Text } from "@mantine/core"
import { IconChevronDown } from "@tabler/icons-react"
import type { ImageDetailViewerProps } from "../ImageDetailViewer/ImageDetailViewer"

type ImageDetailClassificationSectionProps = Pick<ImageDetailViewerProps, "detailValues" | "detailSectionsExpanded" | "toggleDetailSection" | "openDetailEditor"> & { kind: "groups" | "tags" }

export function ImageDetailClassificationSection({ kind, detailValues, detailSectionsExpanded, toggleDetailSection, openDetailEditor }: ImageDetailClassificationSectionProps) {
  const values = detailValues[kind]
  const visible = values.slice(0, 6)
  return (
                              <Box>
                                <Group
                                  justify="space-between"
                                  mb="sm"
                                  wrap="nowrap"
                                >
                                  <Group gap={6}>
                                    <Text size="xs" c="dimmed">
                                      {kind === "groups" ? "Groups" : "Tags"}
                                    </Text>
                                    <Text size="xs" c="dimmed">
                                      ({values.length})
                                    </Text>
                                  </Group>
                                  <Button
                                    size="compact-xs"
                                    variant="subtle"
                                    onClick={() => openDetailEditor(kind)}
                                  >
                                    編集
                                  </Button>
                                </Group>
                                <Group gap={6}>
                                  {values.length === 0 ? (
                                    <Text size="xs" c="dimmed">
                                      未設定
                                    </Text>
                                  ) : (
                                    visible.map((value) => (
                                      <Badge
                                        key={value}
                                        variant={
                                          kind === "tags" ? "light" : "outline"
                                        }
                                        style={{
                                          maxWidth: "100%",
                                          overflowWrap: "anywhere",
                                          height: "auto",
                                          whiteSpace: "normal",
                                        }}
                                      >
                                        {value}
                                      </Badge>
                                    ))
                                  )}
                                </Group>
                                {values.length > 6 && (
                                  <>
                                    <Collapse
                                      in={detailSectionsExpanded[kind]}
                                      transitionDuration={200}
                                    >
                                      <Group gap={6} mt="xs">
                                        {values.slice(6).map((value) => (
                                          <Badge
                                            key={value}
                                            variant={
                                              kind === "tags"
                                                ? "light"
                                                : "outline"
                                            }
                                            style={{
                                              maxWidth: "100%",
                                              overflowWrap: "anywhere",
                                              height: "auto",
                                              whiteSpace: "normal",
                                            }}
                                          >
                                            {value}
                                          </Badge>
                                        ))}
                                      </Group>
                                    </Collapse>
                                    <Group justify="center" mt="xs">
                                      <Button
                                        size="compact-xs"
                                        variant="subtle"
                                        color="gray"
                                        fw={400}
                                        onClick={() =>
                                          toggleDetailSection(kind)
                                        }
                                        aria-expanded={
                                          detailSectionsExpanded[kind]
                                        }
                                        rightSection={
                                          <IconChevronDown
                                            size={14}
                                            style={{
                                              transform: detailSectionsExpanded[
                                                kind
                                              ]
                                                ? "rotate(180deg)"
                                                : "rotate(0deg)",
                                              transition:
                                                "transform 200ms ease",
                                            }}
                                          />
                                        }
                                      >
                                        {detailSectionsExpanded[kind]
                                          ? "折りたたむ"
                                          : `ほか${values.length - 6}件を表示`}
                                      </Button>
                                    </Group>
                                  </>
                                )}
                                {kind === "groups" && (
                                  <Divider
                                    mt="md"
                                    style={{
                                      marginInline:
                                        "calc(-1 * var(--mantine-spacing-md))",
                                    }}
                                  />
                                )}
                              </Box>
  )
}
