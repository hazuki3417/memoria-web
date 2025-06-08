import { useSlider } from "@/hooks/useSlider";
import { ActionIcon, Box, type BoxProps, Slider, Text } from "@mantine/core";
import {
  IconDownload,
  IconInfoCircle,
  IconZoomIn,
  IconZoomOut,
  IconZoomReset,
} from "@tabler/icons-react";
import { useCallback } from "react";
import { ZoomCombobox } from "./ZoomCombobox";

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
  }, [slider.state.value, handler?.onZoomReset]);

  const zoomIn = useCallback(() => {
    slider.handler.up();
    handler?.onZoomIn?.(slider.state.value);
  }, [slider.state.value, handler?.onZoomIn]);

  const zoomOut = useCallback(() => {
    slider.handler.down();
    handler?.onZoomOut?.(slider.state.value);
  }, [slider.state.value, handler?.onZoomOut]);

  const zoomChange = useCallback(
    (value: number) => {
      slider.handler.change(value);
      handler?.onZoomChange?.(value);
    },
    [slider.state.value, handler?.onZoomChange],
  );

  return (
    <Box
      style={(theme) => ({
        height: "40px",
        flexShrink: 0,
        display: "flex",
      })}
    >
      <Box
        style={(theme) => ({
          width: "40px",
          flexShrink: 0,
        })}
      />
      <Box
        style={(theme) => ({
          display: "flex",
          flexGrow: 1,
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
          <ActionIcon
            variant="subtle"
            color="gray"
            onClick={handler?.onDownload}
          >
            <IconDownload />
          </ActionIcon>
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
          <Text size="xs">
            {payload.current} / {payload.limit}
          </Text>
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
          <ActionIcon variant="subtle" color="gray" onClick={zoomReset}>
            <IconZoomReset />
          </ActionIcon>
          <ZoomCombobox
            value={slider.state.value}
            config={slider.state.config}
            handler={{
              onOptionSubmit: zoomChange,
              onBlur: zoomChange,
            }}
          />
          <ActionIcon variant="subtle" color="gray" onClick={zoomOut}>
            <IconZoomOut />
          </ActionIcon>
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
          <ActionIcon variant="subtle" color="gray" onClick={zoomIn}>
            <IconZoomIn />
          </ActionIcon>
        </Box>
      </Box>
      <Box
        style={(theme) => ({
          width: "40px",
          flexShrink: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        })}
      >
        <ActionIcon variant="subtle" color="gray" onClick={handler?.onInfo}>
          <IconInfoCircle />
        </ActionIcon>
      </Box>
    </Box>
  );
};
