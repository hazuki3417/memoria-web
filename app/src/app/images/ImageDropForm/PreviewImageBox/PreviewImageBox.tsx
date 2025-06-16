import { ActionIcon, Box, Image } from "@mantine/core";
import classes from "./PreviewImageBox.module.css";
import React, { useCallback } from "react";
import { IconAlertTriangle, IconX } from "@tabler/icons-react";

export type PreviewImageBoxPayload = {
  src?: string;
  alt?: string;
};

export type PreviewImageBoxUi = {
  selected: boolean;
  selectable: boolean;
  supported: boolean;
  valid?: "idle" | "accept" | "warning" | "reject";
};

export type PreviewImageBoxHandler = {
  onSelect?: (value: number) => void;
  onRemove?: (value: number) => void;
};

export interface PreviewImageBoxProps {
  id: number;
  payload: PreviewImageBoxPayload;
  handler?: PreviewImageBoxHandler;
  ui: PreviewImageBoxUi;
}

export const PreviewImageBox = (props: PreviewImageBoxProps) => {
  const { id, payload, ui, handler } = props;

  const select = useCallback(() => {
    handler?.onSelect?.(id);
  }, [id]);

  const remove = useCallback(
    (event: React.MouseEvent<HTMLButtonElement>) => {
      event.stopPropagation();
      handler?.onRemove?.(id);
    },
    [id],
  );

  return (
    <Box
      className={classes.box}
      onClick={ui.supported ? select : undefined}
      data-selected={ui.supported ? ui.selected : false}
      data-selectable={ui.supported ? ui.selectable : false}
      data-supported={ui.supported}
      data-valid={ui.valid}
      data-testid="select-file"
    >
      <ActionIcon
        className={classes.actionIcon}
        size={20}
        onClick={remove}
        data-testid="remove-file"
      >
        <IconX />
      </ActionIcon>
      {ui.supported === true && (
        <Image
          className={classes.image}
          src={payload.src}
          alt={payload.alt}
          draggable={false}
        />
      )}
      {ui.supported === false && (
        <IconAlertTriangle
          size={80}
          style={{ color: "var(--mantine-color-red-6)" }}
        />
      )}
    </Box>
  );
};
