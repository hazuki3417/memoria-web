import { Flex, FlexProps } from "@mantine/core";
import React from "react";

export interface CenterProps extends Omit<FlexProps, "justify" | "align"> {
  children: React.ReactNode;
}

export const Center = (props: CenterProps) => {
  const { children, ...lest } = props;
  return (
    <Flex flex={1} align="center" justify="flex-center" {...lest}>
      {children}
    </Flex>
  );
};
Center.displayName = "ActionPanel.Center";
