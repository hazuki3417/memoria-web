"use client"

import {
  ActionIcon,
  Box,
  Center,
  Group,
  Image,
  Stack,
  Text,
} from "@mantine/core"
import {
  IconInfoCircle,
  IconPhotoOff,
  IconX,
} from "@tabler/icons-react"
import { AnimatePresence, motion } from "framer-motion"
import { useRef, useState } from "react"
import type { MediaDetailViewerProps } from "../MediaDetailViewer/MediaDetailViewer"
import { MediaDetailZoomControls } from "./MediaDetailZoomControls"
import type { PreviewReadState } from "../mediaDetailReadState"
import { PreviewStatus } from "../MediaDetailReadFeedback"
import { MediaDetailNavigationButton } from "./MediaDetailNavigationButton"
import { MediaDetailRotationControls } from "./MediaDetailRotationControls"

export type MediaDetailPreviewProps = Pick<
  MediaDetailViewerProps,
  | "stateItems"
  | "closeMediaDetail"
  | "setDetail"
  | "prepareNavigation"
  | "compact"
  | "detailZoom"
  | "setDetailZoom"
  | "detailRotate"
  | "setDetailRotate"
  | "detailRotateAnimated"
  | "setDetailRotateAnimated"
  | "detailDirection"
  | "detailInfoOpened"
  | "setDetailInfoOpened"
> & {
  detail: MediaDetailViewerProps["detail"]
  selectedId?: string | null
  navigation?: { previousId: string | null; nextId: string | null; position: number | null; count: number | null }
  navigateById?: (direction: -1 | 1) => void
  prev: NonNullable<MediaDetailViewerProps["detail"]> | null
  next: NonNullable<MediaDetailViewerProps["detail"]> | null
  readState?: PreviewReadState
  onRetryImage?: () => void
  pollingStopped?: boolean
}

export function MediaDetailPreview(props: MediaDetailPreviewProps) {
  const {
    detail,
    selectedId,
    navigation,
    navigateById,
    stateItems,
    prev,
    next,
    closeMediaDetail,
    setDetail,
    prepareNavigation,
    compact,
    detailZoom,
    setDetailZoom,
    detailRotate,
    setDetailRotate,
    detailRotateAnimated,
    setDetailRotateAnimated,
    detailDirection,
    detailInfoOpened,
    setDetailInfoOpened,
    readState,
    onRetryImage,
    pollingStopped,
  } = props
  const activeId = selectedId ?? detail?.id ?? null
  const detailIndex = stateItems.findIndex((item) => item.id === activeId)
  const imageKey = readState?.kind === "ready" ? `${activeId}:${readState.url}` : null
  // Render-time identity guard: reject callbacks from an image that is no longer selected.
  const currentImageKey = useRef(imageKey)
  currentImageKey.current = imageKey
  const [imageStatus, setImageStatus] = useState<{ key: string; status: "loading" | "ready" | "error"; attempt: number } | null>(null)
  const activeImageStatus = imageKey && imageStatus?.key === imageKey ? imageStatus.status : "loading"
  const imageAttempt = imageKey && imageStatus?.key === imageKey ? imageStatus.attempt : 0
  const retryImage = () => {
    if (!imageKey) return
    setImageStatus({ key: imageKey, status: "loading", attempt: imageAttempt + 1 })
    onRetryImage?.()
  }
  const previousAvailable = navigation ? navigation.previousId !== null : prev !== null
  const nextAvailable = navigation ? navigation.nextId !== null : next !== null
  return (
    <Box
      style={{
        minWidth: 0,
        minHeight: 0,
        display: "flex",
        flexDirection: "column",
      }}
    >
      <Group h={44} px="xs" justify="flex-end" style={{ flexShrink: 0 }}>
        <ActionIcon
          variant="subtle"
          color="gray"
          aria-label="閉じる"
          onClick={closeMediaDetail}
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
          {previousAvailable && (
            <MediaDetailNavigationButton direction={-1} onNavigate={() => { prepareNavigation(-1); if (navigateById) navigateById(-1); else if (prev) setDetail(prev) }} />
          )}
        </Center>
        <Center h="100%" style={{ minWidth: 0, overflow: "hidden" }}>
          <AnimatePresence mode="wait" initial={false} custom={detailDirection}>
            <motion.div
              key={activeId}
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
              {readState && readState.kind !== "ready" ? (
                <PreviewStatus state={readState} onRetry={onRetryImage} pollingStopped={pollingStopped} />
              ) : detail?.failed ? (
                <Stack align="center" c="dimmed">
                  <IconPhotoOff size={48} />
                  <Text size="sm">画像を表示できません</Text>
                </Stack>
              ) : readState?.kind === "ready" && imageKey ? (
                <Box w="100%" h="100%" style={{ position: "relative" }}>
                  <Image
                    key={`${imageKey}:${imageAttempt}`}
                    src={readState.url}
                    alt={detail?.label ?? "Media"}
                    w="100%"
                    h="100%"
                    fit="contain"
                    onLoad={(event) => {
                      const image = event.currentTarget
                      void image.decode().then(
                        () => setImageStatus((current) =>
                          currentImageKey.current !== imageKey || (current?.key === imageKey && (current.attempt !== imageAttempt || current.status === "error"))
                            ? current : { key: imageKey, status: "ready", attempt: imageAttempt }),
                        () => setImageStatus((current) =>
                          currentImageKey.current !== imageKey || (current?.key === imageKey && current.attempt !== imageAttempt)
                            ? current : { key: imageKey, status: "error", attempt: imageAttempt }),
                      )
                    }}
                    onError={() => setImageStatus((current) =>
                      current && (current.key !== imageKey || current.attempt !== imageAttempt)
                        ? current : { key: imageKey, status: "error", attempt: imageAttempt },
                    )}
                    style={{
                      objectFit: "contain",
                      opacity: activeImageStatus === "ready" ? 1 : 0,
                      transform: `rotate(${detailRotate}deg) scale(${detailZoom / 100})`,
                      transition: detailRotateAnimated ? "transform 180ms ease" : "none",
                    }}
                  />
                  {activeImageStatus !== "ready" && (
                    <Box style={{ position: "absolute", inset: 0 }}>
                      <PreviewStatus
                        state={activeImageStatus === "error"
                          ? { kind: "delivery-error", retryable: true }
                          : { kind: "image-loading" }}
                        onRetry={retryImage}
                      />
                    </Box>
                  )}
                </Box>
              ) : detail ? (
                <Image
                  src={detail.src}
                  alt={detail.label}
                  w="100%"
                  h="100%"
                  fit="contain"
                  style={{
                    objectFit: "contain",
                    transform: `rotate(${detailRotate}deg) scale(${detailZoom / 100})`,
                    transition: detailRotateAnimated ? "transform 180ms ease" : "none",
                  }}
                />
              ) : (
                <PreviewStatus state={{ kind: "detail-loading" }} />
              )}
            </motion.div>
          </AnimatePresence>
        </Center>
        <Center>
          {nextAvailable && (
            <MediaDetailNavigationButton direction={1} onNavigate={() => { prepareNavigation(1); if (navigateById) navigateById(1); else if (next) setDetail(next) }} />
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
          {!compact && <MediaDetailRotationControls setRotate={setDetailRotate} setAnimated={setDetailRotateAnimated} />}
        </Group>
        <Text size="xs" c="dimmed" ta="center" style={{ whiteSpace: "nowrap" }}>
          {navigation ? (navigation.position === null || navigation.count === null ? "—" : `${navigation.position + 1} / ${navigation.count}`) : `${detailIndex + 1} / ${stateItems.length}`}
        </Text>
        <Group gap={4} wrap="nowrap" justify="flex-end" style={{ minWidth: 0 }}>
          {!compact && (
            <>
              <MediaDetailZoomControls zoom={detailZoom} setZoom={setDetailZoom} />
            </>
          )}
          <ActionIcon
            variant={detailInfoOpened ? "light" : "subtle"}
            aria-label={detailInfoOpened ? "情報を閉じる" : "情報を開く"}
            onClick={() => setDetailInfoOpened((value) => !value)}
          >
            <IconInfoCircle size={18} />
          </ActionIcon>
        </Group>
      </Box>
    </Box>
  )
}
