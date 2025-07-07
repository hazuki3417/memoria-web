import { Box, BoxProps } from "@mantine/core";
import React from "react";

export interface FormContainerProps extends Omit<BoxProps, "pos"> {
  children: React.ReactNode;
}

export const FormContainer = (props: FormContainerProps) => {
  const { children, ...lest } = props;
  return (
    <Box pos="relative" {...lest}>
      {children}
    </Box>
  );
};
