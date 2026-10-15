"use client"

import { Box, Button, Divider, Group, Stack } from "@mantine/core"
import { IconTrash } from "@tabler/icons-react"
import { AnimatePresence, motion } from "framer-motion"
import { ImageDetailMetadata } from "../ImageDetailMetadata"
import { ImageDetailClassificationSection } from "../ImageDetailClassificationSection"
import { ImageDetailCommunitySection } from "../ImageDetailCommunitySection"
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
                          <ImageDetailClassificationSection kind="groups" detailValues={detailValues} detailSectionsExpanded={detailSectionsExpanded} toggleDetailSection={toggleDetailSection} openDetailEditor={openDetailEditor} />
                          <ImageDetailClassificationSection kind="tags" detailValues={detailValues} detailSectionsExpanded={detailSectionsExpanded} toggleDetailSection={toggleDetailSection} openDetailEditor={openDetailEditor} />
                          <Divider
                            style={{
                              marginInline:
                                "calc(-1 * var(--mantine-spacing-md))",
                            }}
                          />
                          <ImageDetailCommunitySection detailValues={detailValues} detailSectionsExpanded={detailSectionsExpanded} toggleDetailSection={toggleDetailSection} setUnshareTarget={setUnshareTarget} setShareTarget={setShareTarget} setDetailEditor={setDetailEditor} context={contextKind} />
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
