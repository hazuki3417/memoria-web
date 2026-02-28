import { ActionIcon, Box, type BoxProps, Slider, Text } from "@mantine/core"
import {
  IconDownload,
  IconInfoCircle,
  IconZoomIn,
  IconZoomOut,
  IconZoomReset,
} from "@tabler/icons-react"
import React, { memo } from "react"
import { RotateButtonGroup } from "./RotateButtonGroup"
import { ZoomCombobox } from "./ZoomCombobox"
import { styles } from "./styles"

export type FooterPayload = {
  current: number
  limit: number
}

export type FooterUi = {
  level: number
}

export type FooterConfig = {
  step: number
  min: number
  max: number
}

export type FooterHandler = {
  onDownload?: React.MouseEventHandler<HTMLButtonElement>
  onInfo?: React.MouseEventHandler<HTMLButtonElement>
  onZoomChange?: (value: number) => void
  onZoomIn?: React.MouseEventHandler<HTMLButtonElement>
  onZoomOut?: React.MouseEventHandler<HTMLButtonElement>
  onZoomReset?: React.MouseEventHandler<HTMLButtonElement>
  onRotateLeft?: React.MouseEventHandler<HTMLButtonElement>
  onRotateRight?: React.MouseEventHandler<HTMLButtonElement>
  onRotateReset?: React.MouseEventHandler<HTMLButtonElement>
}

export interface FooterProps extends BoxProps {
  payload: FooterPayload
  ui: FooterUi
  config: FooterConfig
  handler?: FooterHandler
}

export const Footer = (props: FooterProps) => {
  const { payload, ui, config, handler } = props

  return (
    <Box
      style={(theme) => ({
        display: "flex",
        height: `${styles.NAVIGATION_HEIGHT}px`,
        width: "100%",
      })}
    >
      <Box
        style={(theme) => ({
          width: `${styles.SIDEBAR_WIDTH}px`,
        })}
      />
      <Box
        style={(theme) => ({
          width: `calc(100% - ${styles.SIDEBAR_WIDTH * 2}px)`,
          display: "flex",
          justifyContent: "space-between",
        })}
      >
        <Box
          style={(theme) => ({
            alignItems: "center",
            display: "flex",
            flexBasis: 0,
            flexGrow: 1,
            flexShrink: 1,
            gap: "8px",
            justifyContent: "start",
          })}
        >
          <MemoDownloadButton onClick={handler?.onDownload} />
          <MemoRotateButtonGroup
            onLeft={handler?.onRotateLeft}
            onReset={handler?.onRotateReset}
            onRight={handler?.onRotateRight}
          />
        </Box>
        <Box
          style={(theme) => ({
            alignItems: "center",
            display: "flex",
            flexBasis: 0,
            flexGrow: 1,
            flexShrink: 1,
            justifyContent: "center",
          })}
        >
          <MemoIndex {...payload} />
        </Box>
        <Box
          style={(theme) => ({
            alignItems: "center",
            display: "flex",
            flexBasis: 0,
            flexGrow: 1,
            flexShrink: 1,
            gap: "4px",
            justifyContent: "end",
          })}
        >
          <MemoZoomOutButton onClick={handler?.onZoomOut} />
          <MemoZoomResetButton onClick={handler?.onZoomReset} />
          <Slider
            w={120}
            color="gray"
            size="sm"
            radius="xs"
            showLabelOnHover={false}
            value={ui.level}
            min={config.min}
            max={config.max}
            onChange={handler?.onZoomChange}
          />
          <MemoZoomInButton onClick={handler?.onZoomIn} />
          <ZoomCombobox
            value={ui.level}
            config={config}
            handler={{
              onOptionSubmit: handler?.onZoomChange,
              onBlur: handler?.onZoomChange,
            }}
          />
        </Box>
      </Box>
      <Box
        style={(theme) => ({
          width: `${styles.SIDEBAR_WIDTH}px`,
          flexShrink: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        })}
      >
        <MemoInfoButton onClick={handler?.onInfo} />
      </Box>
    </Box>
  )
}

const MemoIndex = memo((props: FooterPayload) => (
  <Text size="xs">
    {props.current} / {props.limit}
  </Text>
))

const MemoDownloadButton = memo(
  (props: { onClick?: React.MouseEventHandler<HTMLButtonElement> }) => (
    <ActionIcon
      size={"input-xs"}
      onClick={props.onClick}
      data-testid="download-image"
    >
      <IconDownload />
    </ActionIcon>
  ),
)

const MemoRotateButtonGroup = memo(RotateButtonGroup)

const MemoZoomResetButton = memo(
  (props: { onClick?: React.MouseEventHandler<HTMLButtonElement> }) => (
    <ActionIcon
      size={"input-xs"}
      onClick={props.onClick}
      data-testid="zoom-reset"
    >
      <IconZoomReset />
    </ActionIcon>
  ),
)

const MemoZoomOutButton = memo(
  (props: { onClick?: React.MouseEventHandler<HTMLButtonElement> }) => (
    <ActionIcon
      size={"input-xs"}
      onClick={props.onClick}
      data-testid="zoom-out"
    >
      <IconZoomOut />
    </ActionIcon>
  ),
)

const MemoZoomInButton = memo(
  (props: { onClick?: React.MouseEventHandler<HTMLButtonElement> }) => (
    <ActionIcon size={"input-xs"} onClick={props.onClick} data-testid="zoom-in">
      <IconZoomIn />
    </ActionIcon>
  ),
)

const MemoInfoButton = memo(
  (props: { onClick?: React.MouseEventHandler<HTMLButtonElement> }) => (
    <ActionIcon
      size={"input-xs"}
      onClick={props.onClick}
      data-testid="open-info"
    >
      <IconInfoCircle />
    </ActionIcon>
  ),
)
