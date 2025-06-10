import { ActionIcon, Box, type BoxProps, Slider, Text } from "@mantine/core";
import {
  IconDownload,
  IconInfoCircle,
  IconZoomIn,
  IconZoomOut,
  IconZoomReset,
} from "@tabler/icons-react";
import React, { memo, useCallback, useMemo } from "react";
import { ZoomCombobox } from "./ZoomCombobox";
import { styles } from "./styles";

export type FooterPayload = {
  current: number;
  limit: number;
};

export type FooterUi = {
  level: number;
};

export type FooterConfig = {
  step: number;
  min: number;
  max: number;
};

export type FooterHandler = {
  onDownload?: React.MouseEventHandler<HTMLButtonElement>;
  onInfo?: React.MouseEventHandler<HTMLButtonElement>;
  onZoomChange?: (value: number) => void;
  onZoomIn?: React.MouseEventHandler<HTMLButtonElement>;
  onZoomOut?: React.MouseEventHandler<HTMLButtonElement>;
  onZoomReset?: React.MouseEventHandler<HTMLButtonElement>;
};

export interface FooterProps extends BoxProps {
  payload: FooterPayload;
  ui: FooterUi;
  config: FooterConfig;
  handler?: FooterHandler;
}

export const Footer = (props: FooterProps) => {
  const { payload, ui, config, handler } = props;

  return (
    <Box
      style={(theme) => ({
        height: `${styles.NAVIGATION_HEIGHT}px`,
        display: "flex",
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
            gap: "4px",
            justifyContent: "start",
          })}
        >
          <DownloadButton onClick={handler?.onDownload} />
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
          <Index {...payload} />
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
          <ZoomResetButton onClick={handler?.onZoomReset} />
          <ZoomCombobox
            value={ui.level}
            config={config}
            handler={{
              onOptionSubmit: handler?.onZoomChange,
              onBlur: handler?.onZoomChange,
            }}
          />
          <ZoomOutButton onClick={handler?.onZoomOut} />
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
          <ZoomInButton onClick={handler?.onZoomIn} />
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
        <InfoButton onClick={handler?.onInfo} />
      </Box>
    </Box>
  );
};

const Index = memo((props: FooterPayload) => (
  <Text size="xs">
    {props.current} / {props.limit}
  </Text>
));

const DownloadButton = memo(
  (props: { onClick?: React.MouseEventHandler<HTMLButtonElement> }) => (
    <ActionIcon onClick={props.onClick} data-testid="download-image">
      <IconDownload />
    </ActionIcon>
  ),
);

const ZoomResetButton = memo(
  (props: { onClick?: React.MouseEventHandler<HTMLButtonElement> }) => (
    <ActionIcon onClick={props.onClick} data-testid="zoom-reset">
      <IconZoomReset />
    </ActionIcon>
  ),
);

const ZoomOutButton = memo(
  (props: { onClick?: React.MouseEventHandler<HTMLButtonElement> }) => (
    <ActionIcon onClick={props.onClick} data-testid="zoom-out">
      <IconZoomOut />
    </ActionIcon>
  ),
);

const ZoomInButton = memo(
  (props: { onClick?: React.MouseEventHandler<HTMLButtonElement> }) => (
    <ActionIcon onClick={props.onClick} data-testid="zoom-in">
      <IconZoomIn />
    </ActionIcon>
  ),
);

const InfoButton = memo(
  (props: { onClick?: React.MouseEventHandler<HTMLButtonElement> }) => (
    <ActionIcon onClick={props.onClick} data-testid="open-info">
      <IconInfoCircle />
    </ActionIcon>
  ),
);
