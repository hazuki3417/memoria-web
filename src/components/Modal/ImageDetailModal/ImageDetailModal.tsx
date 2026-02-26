import { useDisclosure } from "@/hooks";
import { Box, type BoxProps } from "@mantine/core";
import { AnimatePresence, motion } from "framer-motion";
import { Info, InfoHandler, InfoPayload } from "./Info/Info";
import { Slide, SlideHandler, SlidePayload } from "./Slide";
import React, { useCallback, useMemo } from "react";
import { Preview } from "./Preview";
import { useImageRotate } from "@/hooks/useImageRotate";
import { useImageZoom } from "@/hooks/useImageZoom";

export type ImageDetailModalPayload = {
  slide: SlidePayload;
  info: InfoPayload;
};

export type ImageDetailModalHandler = Omit<
  SlideHandler,
  "onInfo" | "onZoomIn" | "onZoomOut" | "onZoomChange"
> &
  Omit<InfoHandler, "onClose"> & {};

export interface ImageDetailModalProps extends BoxProps {
  payload: ImageDetailModalPayload;
  handler?: ImageDetailModalHandler;
}

export const ImageDetailModal = (props: ImageDetailModalProps) => {
  const { payload, handler } = props;
  const { onClose, onDelete, onDownload, onEdit, onNext, onPrev } =
    handler ?? {};
  const drawer = useDisclosure({ opend: false });
  const imageRotate = useImageRotate({ angle: 0 });
  const imageZoom = useImageZoom({
    level: 100,
    config: { step: 10, min: 100, max: 300 },
  });

  const zoomReset = useCallback(() => {
    imageZoom.handler.reset();
  }, [imageZoom.handler, imageZoom.state.level]);

  const zoomIn = useCallback(() => {
    imageZoom.handler.zoomIn();
  }, [imageZoom.handler, imageZoom.state.level]);

  const zoomOut = useCallback(() => {
    imageZoom.handler.zoomOut();
  }, [imageZoom.handler, imageZoom.state.level]);

  const zoomSet = useCallback(
    (value: number) => {
      imageZoom.handler.set(value);
    },
    [imageZoom.handler, imageZoom.state.level],
  );

  const previewAction = useMemo(() => {
    if (imageRotate.state.meta.action === "left") {
      return "rotate";
    }
    if (imageRotate.state.meta.action === "right") {
      return "rotate";
    }
    return "reset";
  }, [imageRotate.state.meta.action]);

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
          level: imageZoom.state.level,
        }}
        handler={{
          onClose,
          onDownload,
          onInfo: drawer.handler.toggle,
          onNext,
          onPrev,
          onZoomReset: zoomReset,
          onZoomChange: zoomSet,
          onZoomIn: zoomIn,
          onZoomOut: zoomOut,
          onRotateLeft: imageRotate.handler.left,
          onRotateReset: imageRotate.handler.reset,
          onRotateRight: imageRotate.handler.right,
        }}
      >
        <Preview
          ui={{
            rotate: imageRotate.state.angle,
            scale: imageZoom.state.scale,
            action: previewAction,
          }}
        />
      </Slide>
      <AnimatePresence>
        {drawer.state.opend && (
          <motion.div
            data-testid="motion-div"
            animate={{ width: 340, opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            initial={{ width: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Info
              payload={payload.info}
              handler={{
                onClose: drawer.handler.close,
                onDelete,
                onEdit,
              }}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </Box>
  );
};
