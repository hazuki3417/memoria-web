"use client"

import { ActionIcon, Badge, Box, Button, Center, Collapse, Divider, Group, Image, Modal, Slider, Stack, Text } from "@mantine/core"
import { IconChevronDown, IconChevronLeft, IconChevronRight, IconDownload, IconInfoCircle, IconPhotoOff, IconPlus, IconRotate, IconRotate2, IconTrash, IconX, IconZoomIn, IconZoomOut, IconZoomReset } from "@tabler/icons-react"
import { AnimatePresence, motion } from "framer-motion"
import type { Dispatch, SetStateAction } from "react"
import type { MediaItem } from "@/features/image-detail/types"
import { ZoomInput } from "../ZoomInput"
import type { useImageDetailEditing } from "@/features/image-detail/useImageDetailEditing"
import type { useImageDetailViewport } from "@/features/image-detail/useImageDetailViewport"

type Editing = ReturnType<typeof useImageDetailEditing>
type Viewport = ReturnType<typeof useImageDetailViewport>
type Props = Pick<Editing, "detailValues" | "detailSectionsExpanded" | "toggleDetailSection" | "openDetailEditor" | "setUnshareTarget" | "setShareTarget" | "setDetailEditor"> & Pick<Viewport, "prepareNavigation" | "detailInfoOpened" | "setDetailInfoOpened" | "detailZoom" | "setDetailZoom" | "detailRotate" | "setDetailRotate" | "detailRotateAnimated" | "setDetailRotateAnimated" | "detailDirection"> & {
  detail: MediaItem | null
  setDetail: Dispatch<SetStateAction<MediaItem | null>>
  closeImageDetail: () => void
  stateItems: MediaItem[]
  compact: boolean | undefined
  context: "personal" | "community"
  downloadMock: "available" | "forbidden" | "processing"
}

/** Original MediaBrowser detail viewport markup, preserved for visual parity. */
export function ImageDetailViewer({
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
}: Props) {
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
                          <Stack gap="xs">
                            <Group justify="space-between">
                              <Text size="xs" c="dimmed">
                                ファイルサイズ
                              </Text>
                              <Text size="xs">8.4 MB</Text>
                            </Group>
                            <Group justify="space-between">
                              <Text size="xs" c="dimmed">
                                サイズ
                              </Text>
                              <Text size="xs">4032 × 3024</Text>
                            </Group>
                            <Group justify="space-between">
                              <Text size="xs" c="dimmed">
                                アップロード
                              </Text>
                              <Text size="xs">2026/10/03 08:42</Text>
                            </Group>
                            <Group justify="space-between">
                              <Text size="xs" c="dimmed">
                                Uploader
                              </Text>
                              <Text size="xs">Hazuki</Text>
                            </Group>
                          </Stack>
                          <Stack gap={4}>
                            <Button
                              size="xs"
                              variant="default"
                              fullWidth
                              disabled={downloadMock !== "available"}
                              leftSection={<IconDownload size={15} />}
                              aria-describedby={
                                downloadMock === "available"
                                  ? undefined
                                  : "original-download-unavailable"
                              }
                            >
                              Originalをダウンロード
                            </Button>
                            {downloadMock !== "available" && (
                              <Group
                                gap={5}
                                align="flex-start"
                                wrap="nowrap"
                                id="original-download-unavailable"
                              >
                                <IconInfoCircle
                                  size={14}
                                  style={{ flexShrink: 0, marginTop: 2 }}
                                />
                                <Text size="xs" c="dimmed">
                                  {downloadMock === "forbidden"
                                    ? "このMediaのOriginalをダウンロードする権限がありません。"
                                    : "Originalを準備中です。処理完了後にダウンロードできます。"}
                                </Text>
                              </Group>
                            )}
                          </Stack>
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
                          {context === "personal" ? (
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
              </Box>
            )
          })()}
      </Modal>
    </>
  )
}
