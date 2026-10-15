"use client"

import { ActionIcon, Box, Center, Group, Image, Slider, Stack, Text } from "@mantine/core"
import { IconChevronLeft, IconChevronRight, IconInfoCircle, IconPhotoOff, IconRotate, IconRotate2, IconX, IconZoomIn, IconZoomOut, IconZoomReset } from "@tabler/icons-react"
import { AnimatePresence, motion } from "framer-motion"
import { ZoomInput } from "../ZoomInput"
import type { ImageDetailViewerProps } from "../ImageDetailViewer/ImageDetailViewer"

export function ImageDetailPreview(props: Omit<ImageDetailViewerProps, "detail"> & { detail: NonNullable<ImageDetailViewerProps["detail"]>; prev: NonNullable<ImageDetailViewerProps["detail"]> | null; next: NonNullable<ImageDetailViewerProps["detail"]> | null }) {
  const { detail, prev, next, closeImageDetail, setDetail, prepareNavigation, compact, detailZoom, setDetailZoom, detailRotate, setDetailRotate, detailRotateAnimated, setDetailRotateAnimated, detailDirection, detailInfoOpened, setDetailInfoOpened } = props
  return (
    <>
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
    </>
  )
}
