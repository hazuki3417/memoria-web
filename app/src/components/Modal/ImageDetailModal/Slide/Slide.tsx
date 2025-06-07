import { Box, type BoxProps } from "@mantine/core";
import { Header, HeaderHandler } from "./Header";
import { Body, BodyHandler } from "./Body";
import { Footer, FooterHandler, FooterPayload } from "./Footer";
import React from "react";

export type SlidePayload = {
  footer: FooterPayload;
};

export type SlideHandler = HeaderHandler & BodyHandler & FooterHandler;

export interface SlideProps extends BoxProps {
  children: React.ReactNode;
  payload: SlidePayload;
  handler?: SlideHandler;
}

export const Slide = (props: SlideProps) => {
  const { children, payload, handler } = props;
  const { onClose, onDownload, onInfo, onNext, onPrev, onZoomIn, onZoomOut } =
    handler ?? {};
  return (
    <Box
      style={(theme) => ({
        display: "flex",
        flexDirection: "row",
        flexGrow: 1,
      })}
    >
      <Box
        style={(theme) => ({
          display: "flex",
          flexDirection: "column",
          height: "100%",
          flexGrow: 1,
        })}
      >
        <Header
          handler={{
            onClose,
          }}
        />
        <Body handler={{ onNext, onPrev }}>{children}</Body>
        <Footer
          payload={payload.footer}
          handler={{
            onDownload,
            onInfo,
            onZoomIn,
            onZoomOut,
          }}
        />
      </Box>
    </Box>
  );
};
