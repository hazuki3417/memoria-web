"use client"

import { Badge, Box, Button, Collapse, Divider, Group, Stack, Text } from "@mantine/core"
import { IconChevronDown, IconDownload, IconInfoCircle, IconPlus, IconTrash } from "@tabler/icons-react"
import { AnimatePresence, motion } from "framer-motion"
import { ImageDetailMetadata } from "../ImageDetailMetadata"
import type { ImageDetailViewerProps } from "../ImageDetailViewer/ImageDetailViewer"

export function ImageDetailInfoPanel({ compact, detailInfoOpened, detailValues, detailSectionsExpanded, toggleDetailSection, openDetailEditor, setUnshareTarget, setShareTarget, setDetailEditor, context: contextKind, downloadMock }: ImageDetailViewerProps) {
  return (
    <>
                <AnimatePresence initial={false}>
                  {detailInfoOpened && (
                    <motion.div
                      initial={
                        compact
                          ? { height: 0, opacity: 0 }
                          : { width: 0, opacity: 0 }
                      }
                      animate={
                        compact
                          ? { height: "auto", opacity: 1 }
                          : { width: 340, opacity: 1 }
                      }
                      exit={
                        compact
                          ? { height: 0, opacity: 0 }
                          : { width: 0, opacity: 0 }
                      }
                      transition={{ duration: 0.3 }}
                      style={{
                        overflow: "hidden",
                        minWidth: 0,
                        gridColumn: compact ? "1" : "2",
                        gridRow: compact ? "2" : "1",
                      }}
                    >
                      <Box
                        h="100%"
                        bg="var(--mantine-color-body)"
                        style={{
                          borderLeft: compact
                            ? undefined
                            : "1px solid var(--mantine-color-default-border)",
                          borderTop: compact
                            ? "1px solid var(--mantine-color-default-border)"
                            : undefined,
                          display: "flex",
                          flexDirection: "column",
                          overflow: "hidden",
                        }}
                      >
                        <Stack
                          gap="md"
                          p="md"
                          style={{ flex: 1, overflowY: "auto" }}
                        >
                          <ImageDetailMetadata downloadMock={downloadMock} />
                          <Divider
                            style={{
                              marginInline:
                                "calc(-1 * var(--mantine-spacing-md))",
                            }}
                          />
                          {(["groups", "tags"] as const).map((kind) => {
                            const values = detailValues[kind]
                            const visible = values.slice(0, 6)
                            return (
                              <Box key={kind}>
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
                          })}
                          <Divider
                            style={{
                              marginInline:
                                "calc(-1 * var(--mantine-spacing-md))",
                            }}
                          />
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
                        </Stack>
                        <Box
                          p="md"
                          style={{
                            borderTop:
                              "1px solid var(--mantine-color-default-border)",
                            flexShrink: 0,
                          }}
                        >
                          <Group justify="flex-end">
                            <Button
                              size="xs"
                              variant="subtle"
                              color="red"
                              leftSection={<IconTrash size={15} />}
                            >
                              削除
                            </Button>
                          </Group>
                        </Box>
                      </Box>
                    </motion.div>
                  )}
                </AnimatePresence>
    </>
  )
}
