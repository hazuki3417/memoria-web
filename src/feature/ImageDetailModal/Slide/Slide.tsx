import { Box } from "@mantine/core"
import React from "react"
import { Body } from "./Body/Body"
import { Footer, FooterHandler, FooterPayload, FooterUi } from "./Footer"
import { Header, HeaderHandler } from "./Header"
import { NextButton } from "./NextButton"
import { PrevButton } from "./PrevButton"

export type SlidePayload = FooterPayload

export type SlideUi = {
  showPrev?: boolean
  showNext?: boolean
} & FooterUi

export type SlideHandler = HeaderHandler & {
  onPrev?: React.MouseEventHandler<HTMLButtonElement>
  onNext?: React.MouseEventHandler<HTMLButtonElement>
} & FooterHandler

export interface SlideProps {
  children: React.ReactNode
  payload: SlidePayload
  ui: SlideUi
  handler?: SlideHandler
}

export const Slide = (props: SlideProps) => {
  const { children, payload, ui, handler } = props
  const { showPrev = true, showNext = false, level } = ui ?? {}
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
      <Body>
        <Body.Left>{showPrev && <PrevButton onClick={onPrev} />}</Body.Left>
        <Body.Center>{children}</Body.Center>
        <Body.Right>{showNext && <NextButton onClick={onNext} />}</Body.Right>
      </Body>
      <Footer
        payload={payload}
        ui={{ level }}
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
