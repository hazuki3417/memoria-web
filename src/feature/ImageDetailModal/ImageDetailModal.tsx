import { useDisclosure, useImageRotate, useImageZoom } from "@/hooks"
import { DEFAULT_FILE_SIZE_PREFIX, FileSizePrefix } from "@/lib/transform"
import { Box, type BoxProps } from "@mantine/core"
import { AnimatePresence, motion } from "framer-motion"
import { useCallback, useMemo } from "react"
import { Info, InfoHandler, InfoPayload } from "./Info/Info"
import { Preview, PreviewPayload } from "./Preview"
import { Slide, SlideHandler, SlidePayload } from "./Slide"

export type ImageDetailModalPayload = {
  slide: SlidePayload
  info: InfoPayload
  preview: PreviewPayload
}

export type ImageDetailModalHandler = Omit<
  SlideHandler,
  "onInfo" | "onZoomIn" | "onZoomOut" | "onZoomChange"
> &
  Omit<InfoHandler, "onClose"> & {}

export interface ImageDetailModalProps extends BoxProps {
  payload: ImageDetailModalPayload
  prefix?: FileSizePrefix
  handler?: ImageDetailModalHandler
}

export const ImageDetailModal = (props: ImageDetailModalProps) => {
  const { payload, prefix = DEFAULT_FILE_SIZE_PREFIX, handler } = props
  const { onClose, onDelete, onDownload, onEdit, onNext, onPrev } =
    handler ?? {}
  const drawer = useDisclosure({ status: "closed" })
  const imageRotate = useImageRotate({ angle: 0 })
  const imageZoom = useImageZoom({
    level: 100,
    config: { step: 10, min: 100, max: 300 },
  })

  const zoomReset = useCallback(() => {
    imageZoom.action.reset()
  }, [imageZoom.action, imageZoom.value.level])

  const zoomIn = useCallback(() => {
    imageZoom.control.zoomIn()
  }, [imageZoom.control, imageZoom.value.level])

  const zoomOut = useCallback(() => {
    imageZoom.control.zoomOut()
  }, [imageZoom.control, imageZoom.value.level])

  const zoomSet = useCallback(
    (value: number) => {
      imageZoom.action.set(value)
    },
    [imageZoom.action, imageZoom.value.level],
  )

  const previewAction = useMemo(() => {
    if (imageRotate.value.meta.action === "left") {
      return "rotate"
    }
    if (imageRotate.value.meta.action === "right") {
      return "rotate"
    }
    return "reset"
  }, [imageRotate.value.meta.action])

  return (
    <Box
      data-testid="image-detail-modal"
      style={(theme) => ({
        position: "flex",
        display: "flex",
        flexDirection: "row",
        height: "100%",
        width: "100%",
      })}
    >
      <Slide
        payload={payload.slide}
        ui={{
          level: imageZoom.value.level,
        }}
        handler={{
          onClose,
          onDownload,
          onInfo: drawer.control.toggle,
          onNext,
          onPrev,
          onZoomReset: zoomReset,
          onZoomChange: zoomSet,
          onZoomIn: zoomIn,
          onZoomOut: zoomOut,
          onRotateLeft: imageRotate.control.left,
          onRotateReset: imageRotate.action.reset,
          onRotateRight: imageRotate.control.right,
        }}
      >
        <Preview
          payload={payload.preview}
          ui={{
            rotate: imageRotate.value.angle,
            scale: imageZoom.value.scale,
            action: previewAction,
          }}
        />
      </Slide>
      <AnimatePresence>
        {drawer.value.status === "opened" && (
          <motion.div
            data-testid="motion-div"
            animate={{ width: 340, opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            initial={{ width: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Info
              prefix={prefix}
              payload={payload.info}
              handler={{
                onClose: drawer.control.close,
                onDelete,
                onEdit,
              }}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </Box>
  )
}
