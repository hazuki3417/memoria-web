import { ActionIcon, Box, Image } from "@mantine/core";
import classes from "./PreviewImageBox.module.css";
import React, { useCallback } from "react";
import { IconX } from "@tabler/icons-react";

export interface PreviewImageBoxProps {
  id: number;
  selected: boolean;
  selectable: boolean;
  src: string;
  name: string;
  onSelect?: (value: number) => void;
  onRemove?: (value: number) => void;
}

export const PreviewImageBox = (props: PreviewImageBoxProps) => {
  const { id, selected, selectable, src, name, onSelect, onRemove } = props;

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
      data-selected={selected}
      data-selectable={selectable}
      onClick={select}
    >
      <ActionIcon className={classes.actionIcon} size={20} onClick={remove}>
        <IconX />
      </ActionIcon>
      <Image className={classes.image} src={src} alt={name} draggable={false} />
    </Box>
  );
};
