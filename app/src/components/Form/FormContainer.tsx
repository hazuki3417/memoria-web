import { Box } from "@mantine/core";
import React from "react";

export interface FormContainerProps {
  children: React.ReactNode;
}

export const FormContainer = (props: FormContainerProps) => {
  const { children } = props;
  return <Box pos="relative">{children}</Box>;
};
