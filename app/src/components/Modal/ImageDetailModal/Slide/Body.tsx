import { Box, type BoxProps, UnstyledButton } from "@mantine/core";
import {
  IconChevronCompactLeft,
  IconChevronCompactRight,
} from "@tabler/icons-react";
import type React from "react";

export type BodyHandler = {
  onPrev?: React.MouseEventHandler<HTMLButtonElement>;
  onNext?: React.MouseEventHandler<HTMLButtonElement>;
};

export interface BodyProps extends BoxProps {
  children: React.ReactNode;
  handler?: BodyHandler;
}

export const Body = (props: BodyProps) => {
  const { children, handler } = props;
  return (
    <Box
      style={(theme) => ({
        display: "flex",
        flexGrow: 1,
      })}
    >
      <Box
        style={(theme) => ({
          display: "flex",
          flexDirection: "row",
          flexGrow: 1,
        })}
      >
        <UnstyledButton
          style={(theme) => ({
            width: "40px",
            flexShrink: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          })}
          onClick={handler?.onPrev}
        >
          <IconChevronCompactLeft />
        </UnstyledButton>
        <Box
          style={(theme) => ({
            flexGrow: 1,
          })}
        >
          {children}
        </Box>
        <UnstyledButton
          style={(theme) => ({
            width: "40px",
            flexShrink: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          })}
          onClick={handler?.onNext}
        >
          <IconChevronCompactRight />
        </UnstyledButton>
      </Box>
    </Box>
  );
};
