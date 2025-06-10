import { useSlider } from "@/hooks/useSlider";
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

export type FooterHandler = {
  onZoomReset?: (value: number) => void;
  onZoomIn?: (value: number) => void;
  onZoomOut?: (value: number) => void;
  onZoomChange?: (value: number) => void;
  onDownload?: React.MouseEventHandler<HTMLButtonElement>;
  onInfo?: React.MouseEventHandler<HTMLButtonElement>;
};

export interface FooterProps extends BoxProps {
  payload: FooterPayload;
  handler?: FooterHandler;
}

export const Footer = (props: FooterProps) => {
  const { payload, handler } = props;
  const slider = useSlider({
    value: 100,
    config: { step: 10, min: 100, max: 300 },
  });

  const zoomReset = useCallback(() => {
    slider.handler.reset();
    handler?.onZoomReset?.(slider.state.value);
  }, [slider.handler, slider.state.value, handler?.onZoomReset]);

  const zoomIn = useCallback(() => {
    slider.handler.up();
    handler?.onZoomIn?.(slider.state.value);
  }, [slider.handler, slider.state.value, handler?.onZoomIn]);

  const zoomOut = useCallback(() => {
    slider.handler.down();
    handler?.onZoomOut?.(slider.state.value);
  }, [slider.handler, slider.state.value, handler?.onZoomOut]);

  const zoomChange = useCallback(
    (value: number) => {
      slider.handler.change(value);
      handler?.onZoomChange?.(value);
    },
    [slider.handler, slider.state.value, handler?.onZoomChange],
  );

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
          <ZoomResetButton onClick={zoomReset} />
          <ZoomCombobox
            value={slider.state.value}
            config={slider.state.config}
            handler={{
              onOptionSubmit: zoomChange,
              onBlur: zoomChange,
            }}
          />
          <ZoomOutButton onClick={zoomOut} />
          <Slider
            w={120}
            color="gray"
            size="sm"
            radius="xs"
            showLabelOnHover={false}
            defaultValue={slider.state.initial.value}
            value={slider.state.value}
            min={slider.state.config.min}
            max={slider.state.config.max}
            onChange={zoomChange}
          />
          <ZoomInButton onClick={zoomIn} />
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
