import { Box, BoxProps } from "@mantine/core";
import React from "react";

export interface RightProps extends BoxProps {
  children: React.ReactNode;
}

export const Right = (props: RightProps) => {
  const { children, ...less } = props;
  return <Box {...less}>{children}</Box>;
};
