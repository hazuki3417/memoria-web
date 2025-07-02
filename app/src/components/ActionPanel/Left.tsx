import { Box, BoxProps } from "@mantine/core";
import React from "react";

export interface LeftProps extends BoxProps {
  children: React.ReactNode;
}

export const Left = (props: LeftProps) => {
  const { children, ...less } = props;
  return <Box {...less}>{children}</Box>;
};
