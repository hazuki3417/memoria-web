import { Box, type BoxProps, UnstyledButton } from "@mantine/core";
import {
  IconChevronCompactLeft,
  IconChevronCompactRight,
} from "@tabler/icons-react";
import type React from "react";
import { styles } from "./styles";

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
        height: `calc(100% - ${styles.NAVIGATION_HEIGHT * 2}px)`,
      })}
    >
      <Box
        style={(theme) => ({
          display: "flex",
          flexDirection: "row",
        })}
      >
        <UnstyledButton
          style={(theme) => ({
            alignItems: "center",
            display: "flex",
            justifyContent: "center",
            width: `${styles.SIDEBAR_WIDTH}px`,
          })}
          data-testid="prev-image"
          onClick={handler?.onPrev}
        >
          <IconChevronCompactLeft />
        </UnstyledButton>
        <Box
          style={(theme) => ({
            alignItems: "center",
            display: "flex",
            justifyContent: "center",
            width: `calc(100% - ${styles.SIDEBAR_WIDTH * 2}px)`,
            overflow: "hidden",
          })}
        >
          {children}
        </Box>
        <UnstyledButton
          style={(theme) => ({
            alignItems: "center",
            display: "flex",
            justifyContent: "center",
            width: `${styles.SIDEBAR_WIDTH}px`,
          })}
          data-testid="next-image"
          onClick={handler?.onNext}
        >
          <IconChevronCompactRight />
        </UnstyledButton>
      </Box>
    </Box>
  );
};
