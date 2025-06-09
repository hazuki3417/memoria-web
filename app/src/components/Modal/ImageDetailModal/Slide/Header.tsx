import { ActionIcon, Box, type BoxProps, UnstyledButton } from "@mantine/core";
import { IconX } from "@tabler/icons-react";
import type React from "react";

export type HeaderHandler = {
  onClose?: React.MouseEventHandler<HTMLButtonElement>;
};

export interface HeaderProps extends BoxProps {
  handler?: HeaderHandler;
}

export const Header = (props: HeaderProps) => {
  const { handler } = props;
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
          flexGrow: 1,
        })}
      />
      <Box
        style={(theme) => ({
          width: "40px",
          flexShrink: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        })}
      >
        <ActionIcon
          variant="subtle"
          color="gray"
          data-testid="close-slide"
          onClick={handler?.onClose}
        >
          <IconX />
        </ActionIcon>
      </Box>
    </Box>
  );
};
