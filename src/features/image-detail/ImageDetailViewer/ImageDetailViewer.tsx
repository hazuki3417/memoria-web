"use client"

import { ActionIcon, Badge, Box, Button, Center, Collapse, Divider, Group, Image, Modal, Slider, Stack, Text } from "@mantine/core"
import { IconChevronDown, IconChevronLeft, IconChevronRight, IconDownload, IconInfoCircle, IconPhotoOff, IconPlus, IconRotate, IconRotate2, IconTrash, IconX, IconZoomIn, IconZoomOut, IconZoomReset } from "@tabler/icons-react"
import { AnimatePresence, motion } from "framer-motion"
import type { Dispatch, SetStateAction } from "react"
import type { MediaItem } from "@/features/image-detail/types"
import { ZoomInput } from "../ZoomInput"
import { ImageDetailInfoPanel } from "../ImageDetailInfoPanel"
import type { useImageDetailEditing } from "@/features/image-detail/useImageDetailEditing"
import type { useImageDetailViewport } from "@/features/image-detail/useImageDetailViewport"

type Editing = ReturnType<typeof useImageDetailEditing>
type Viewport = ReturnType<typeof useImageDetailViewport>
export type ImageDetailViewerProps = Pick<Editing, "detailValues" | "detailSectionsExpanded" | "toggleDetailSection" | "openDetailEditor" | "setUnshareTarget" | "setShareTarget" | "setDetailEditor"> & Pick<Viewport, "prepareNavigation" | "detailInfoOpened" | "setDetailInfoOpened" | "detailZoom" | "setDetailZoom" | "detailRotate" | "setDetailRotate" | "detailRotateAnimated" | "setDetailRotateAnimated" | "detailDirection"> & {
  detail: MediaItem | null
  setDetail: Dispatch<SetStateAction<MediaItem | null>>
  closeImageDetail: () => void
  stateItems: MediaItem[]
  compact: boolean | undefined
  context: "personal" | "community"
  downloadMock: "available" | "forbidden" | "processing"
}

/** Original MediaBrowser detail viewport markup, preserved for visual parity. */
export function ImageDetailViewer(props: ImageDetailViewerProps) {
  const {
  detail,
  setDetail,
  closeImageDetail,
  stateItems,
  compact,
  context,
  downloadMock,
  detailValues,
  detailSectionsExpanded,
  toggleDetailSection,
  openDetailEditor,
  setUnshareTarget,
  setShareTarget,
  setDetailEditor,
  prepareNavigation,
  detailInfoOpened,
  setDetailInfoOpened,
  detailZoom,
  setDetailZoom,
  detailRotate,
  setDetailRotate,
  detailRotateAnimated,
  setDetailRotateAnimated,
  detailDirection,
} = props
  return (
    <>
      <Modal
        opened={detail !== null}
        onClose={closeImageDetail}
        fullScreen
        portalProps={{ target: "#application-modal-root" }}
        padding={0}
        withCloseButton={false}
        styles={{
          content: { background: "transparent" },
          body: { height: "100dvh", padding: 0, background: "transparent" },
        }}
      >
        {detail &&
          (() => {
            const detailIndex = stateItems.findIndex(
              (item) => item.id === detail.id,
            )
            const prev = detailIndex > 0 ? stateItems[detailIndex - 1] : null
            const next =
              detailIndex >= 0 && detailIndex < stateItems.length - 1
                ? stateItems[detailIndex + 1]
                : null
            return (
              <Box
                h="100%"
                style={{
                  display: "grid",
                  gridTemplateColumns: compact
                    ? "minmax(0, 1fr)"
                    : "minmax(0, 1fr) auto",
                  gridTemplateRows:
                    compact && detailInfoOpened
                      ? "minmax(0, 1fr) auto"
                      : "minmax(0, 1fr)",
                  background: "transparent",
                }}
              >
                <Box
                  style={{
                    minWidth: 0,
                    minHeight: 0,
                    display: "flex",
                    flexDirection: "column",
                  }}
                >
                  <Group
                    h={44}
                    px="xs"
                    justify="flex-end"
                    style={{ flexShrink: 0 }}
                  >
                    <ActionIcon
                      variant="subtle"
                      color="gray"
                      aria-label="閉じる"
                      onClick={closeImageDetail}
                    >
                      <IconX size={18} />
                    </ActionIcon>
                  </Group>
                  <Box
                    style={{
                      flex: 1,
                      minHeight: 0,
                      display: "grid",
                      gridTemplateColumns: "44px minmax(0, 1fr) 44px",
                      alignItems: "center",
                    }}
                  >
                    <Center>
                      {prev && (
                        <ActionIcon
                          variant="subtle"
                          color="gray"
                          size="lg"
                          aria-label="前のMedia"
                          onClick={() => {
                            prepareNavigation(-1)
                            setDetail(prev)
                          }}
                        >
                          <IconChevronLeft />
                        </ActionIcon>
                      )}
                    </Center>
                    <Center
                      h="100%"
                      style={{ minWidth: 0, overflow: "hidden" }}
                    >
                      <AnimatePresence
                        mode="wait"
                        initial={false}
                        custom={detailDirection}
                      >
                        <motion.div
                          key={detail.id}
                          custom={detailDirection}
                          initial={{
                            x: detailDirection > 0 ? 32 : -32,
                            opacity: 0,
                          }}
                          animate={{ x: 0, opacity: 1 }}
                          exit={{
                            x: detailDirection > 0 ? -32 : 32,
                            opacity: 0,
                          }}
                          transition={{ duration: 0.2, ease: "easeOut" }}
                          style={{
                            width: "100%",
                            height: "100%",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                          }}
                        >
                          {detail.failed ? (
                            <Stack align="center" c="dimmed">
                              <IconPhotoOff size={48} />
                              <Text size="sm">画像を表示できません</Text>
                            </Stack>
                          ) : (
                            <Image
                              src={detail.src}
                              alt={detail.label}
                              w="100%"
                              h="100%"
                              fit="contain"
                              style={{
                                objectFit: "contain",
                                transform: `rotate(${detailRotate}deg) scale(${detailZoom / 100})`,
                                transition: detailRotateAnimated
                                  ? "transform 180ms ease"
                                  : "none",
                              }}
                            />
                          )}
                        </motion.div>
                      </AnimatePresence>
                    </Center>
                    <Center>
                      {next && (
                        <ActionIcon
                          variant="subtle"
                          color="gray"
                          size="lg"
                          aria-label="次のMedia"
                          onClick={() => {
                            prepareNavigation(1)
                            setDetail(next)
                          }}
                        >
                          <IconChevronRight />
                        </ActionIcon>
                      )}
                    </Center>
                  </Box>
                  <Box
                    h={48}
                    px="sm"
                    style={{
                      flexShrink: 0,
                      display: "grid",
                      gridTemplateColumns: "minmax(0, 1fr) auto minmax(0, 1fr)",
                      alignItems: "center",
                      columnGap: 8,
                    }}
                  >
                    <Group gap={4} wrap="nowrap" justify="flex-start">
                      {!compact && (
                        <>
                          <ActionIcon
                            variant="subtle"
                            aria-label="回転をリセット"
                            onClick={() => {
                              setDetailRotateAnimated(false)
                              setDetailRotate(0)
                            }}
                          >
                            <IconRotate2 size={18} />
                          </ActionIcon>
                          <ActionIcon
                            variant="subtle"
                            aria-label="左へ回転"
                            onClick={() => {
                              setDetailRotateAnimated(true)
                              setDetailRotate((value) => value - 90)
                            }}
                          >
                            <IconRotate size={18} />
                          </ActionIcon>
                          <ActionIcon
                            variant="subtle"
                            aria-label="右へ回転"
                            onClick={() => {
                              setDetailRotateAnimated(true)
                              setDetailRotate((value) => value + 90)
                            }}
                          >
                            <IconRotate
                              size={18}
                              style={{ transform: "scaleX(-1)" }}
                            />
                          </ActionIcon>
                        </>
                      )}
                    </Group>
                    <Text
                      size="xs"
                      c="dimmed"
                      ta="center"
                      style={{ whiteSpace: "nowrap" }}
                    >
                      {detailIndex + 1} / {stateItems.length}
                    </Text>
                    <Group
                      gap={4}
                      wrap="nowrap"
                      justify="flex-end"
                      style={{ minWidth: 0 }}
                    >
                      {!compact && (
                        <>
                          <ActionIcon
                            variant="subtle"
                            aria-label="拡大率をリセット"
                            onClick={() => setDetailZoom(100)}
                          >
                            <IconZoomReset size={18} />
                          </ActionIcon>
                          <ActionIcon
                            variant="subtle"
                            aria-label="縮小"
                            disabled={detailZoom <= 50}
                            onClick={() =>
                              setDetailZoom((value) => Math.max(50, value - 10))
                            }
                          >
                            <IconZoomOut size={18} />
                          </ActionIcon>
                          <Slider
                            w={100}
                            size="xs"
                            min={50}
                            max={300}
                            step={10}
                            value={detailZoom}
                            onChange={setDetailZoom}
                            label={null}
                          />
                          <ActionIcon
                            variant="subtle"
                            aria-label="拡大"
                            disabled={detailZoom >= 300}
                            onClick={() =>
                              setDetailZoom((value) =>
                                Math.min(300, value + 10),
                              )
                            }
                          >
                            <IconZoomIn size={18} />
                          </ActionIcon>
                          <ZoomInput
                            value={detailZoom}
                            onChange={setDetailZoom}
                          />
                        </>
                      )}
                      <ActionIcon
                        variant={detailInfoOpened ? "light" : "subtle"}
                        aria-label={
                          detailInfoOpened ? "情報を閉じる" : "情報を開く"
                        }
                        onClick={() => setDetailInfoOpened((value) => !value)}
                      >
                        <IconInfoCircle size={18} />
                      </ActionIcon>
                    </Group>
                  </Box>
                </Box>

                <ImageDetailInfoPanel {...props} />
              </Box>
            )
          })()}
      </Modal>
    </>
  )
}
