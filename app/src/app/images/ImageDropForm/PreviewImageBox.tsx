import { ActionIcon, Box, Image } from "@mantine/core";
import classes from "./PreviewImageBox.module.css";
import React, { useCallback } from "react";
import { IconAlertTriangle, IconX } from "@tabler/icons-react";

export const TYPE = {
  VALID: "valid",
  INVALID: "invalid",
  UNSUPPORTED: "unsupported",
} as const;

export type PreviewImageBoxType = (typeof TYPE)[keyof typeof TYPE];

export type PreviewImageBoxUi = {
  type: PreviewImageBoxType;
};

export interface PreviewImageBoxProps {
  id: number;
  src?: string;
  alt?: string;
  selected: boolean;
  selectable: boolean;
  ui: PreviewImageBoxUi;
  onSelect?: (value: number) => void;
  onRemove?: (value: number) => void;
}

export const PreviewImageBox = (props: PreviewImageBoxProps) => {
  const { id, selected, selectable, src, alt, ui, onSelect, onRemove } = props;

  const select = useCallback(() => {
    onSelect?.(id);
  }, [id]);

  const remove = useCallback(
    (event: React.MouseEvent<HTMLButtonElement>) => {
      event.stopPropagation();
      onRemove?.(id);
    },
    [id],
  );

  return (
    <Box
      className={classes.box}
      data-selected={ui.type === "valid" ? selected : false}
      data-selectable={ui.type === "valid" ? selectable : false}
      onClick={ui.type === "valid" ? select : undefined}
      data-type={ui.type}
    >
      <ActionIcon className={classes.actionIcon} size={20} onClick={remove}>
        <IconX />
      </ActionIcon>
      {ui.type !== "unsupported" && (
        <Image
          className={classes.image}
          src={src}
          alt={alt}
          draggable={false}
        />
      )}
      {ui.type === "unsupported" && (
        <IconAlertTriangle
          size={80}
          style={{ color: "var(--mantine-color-red-6)" }}
        />
      )}
    </Box>
  );
};
