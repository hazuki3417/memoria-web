import { Box } from "@mantine/core"
import React from "react"
import { Body, BodyHandler } from "./Body"
import { Footer, FooterHandler, FooterPayload, FooterUi } from "./Footer"
import { Header, HeaderHandler } from "./Header"

export type SlidePayload = FooterPayload

export type SlideUi = FooterUi

export type SlideHandler = HeaderHandler & BodyHandler & FooterHandler

export interface SlideProps {
  children: React.ReactNode
  payload: SlidePayload
  ui: SlideUi
  handler?: SlideHandler
}

export const Slide = (props: SlideProps) => {
  const { children, payload, ui, handler } = props
  const {
    onClose,
    onDownload,
    onInfo,
    onNext,
    onPrev,
    onZoomChange,
    onZoomIn,
    onZoomOut,
    onZoomReset,
    onRotateLeft,
    onRotateReset,
    onRotateRight,
  } = handler ?? {}

  return (
    <Box
      data-testid="slide"
      style={(theme) => ({
        display: "flex",
        flexDirection: "column",
        width: "100%",
      })}
    >
      <Header
        handler={{
          onClose,
        }}
      />
      <Body handler={{ onNext, onPrev }}>{children}</Body>
      <Footer
        payload={payload}
        ui={ui}
        config={{
          step: 10,
          min: 100,
          max: 300,
        }}
        handler={{
          onDownload,
          onInfo,
          onZoomChange,
          onZoomIn,
          onZoomOut,
          onZoomReset,
          onRotateLeft,
          onRotateReset,
          onRotateRight,
        }}
      />
    </Box>
  )
}
