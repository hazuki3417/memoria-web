import { useDisclosure } from "@/hooks";
import { Box, type BoxProps } from "@mantine/core";
import { AnimatePresence, motion } from "framer-motion";
import { Info, InfoHandler, InfoPayload } from "./Info/Info";
import { Slide, SlideHandler, SlidePayload } from "./Slide";
import React from "react";
import { Preview } from "./Preview";

export type ImageDetailModalPayload = {
  slide: SlidePayload;
  info: InfoPayload;
};

export type ImageDetailModalHandler = Omit<SlideHandler, "onInfo"> &
  Omit<InfoHandler, "onClose">;

export interface ImageDetailModalProps extends BoxProps {
  payload: ImageDetailModalPayload;
  handler?: ImageDetailModalHandler;
}

export const ImageDetailModal = (props: ImageDetailModalProps) => {
  const { payload, handler } = props;
  const {
    onClose,
    onDelete,
    onDownload,
    onEdit,
    onNext,
    onPrev,
    onZoomIn,
    onZoomOut,
    onZoomChange,
  } = handler ?? {};
  const drawer = useDisclosure({ opend: false });
  return (
    <Box
      data-testid="image-detail-modal"
      style={(theme) => ({
        display: "flex",
        flexDirection: "row",
        height: "100vh",
        width: "100vw",
      })}
    >
      <Slide
        payload={payload.slide}
        handler={{
          onClose,
          onDownload,
          onInfo: drawer.handler.toggle,
          onNext,
          onPrev,
          onZoomChange,
          onZoomIn,
          onZoomOut,
        }}
      >
        <Preview />
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
