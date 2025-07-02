import { Box, BoxProps } from "@mantine/core";
import React from "react";

export interface CenterProps extends BoxProps {
  children: React.ReactNode;
}

export const Center = (props: CenterProps) => {
  const { children, ...less } = props;
  return <Box {...less}>{children}</Box>;
};
