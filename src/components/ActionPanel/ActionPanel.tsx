import { Flex } from "@mantine/core";
import React, { memo } from "react";
import { Left } from "./Left";
import { Center } from "./Center";
import { Right } from "./Right";

const MemoizedLeft = memo(Left);
const MemoizedCenter = memo(Center);
const MemoizedRight = memo(Right);

export interface ActionPanelProps {
  left?: React.ReactNode;
  center?: React.ReactNode;
  right?: React.ReactNode;
}

export const ActionPanel = (props: ActionPanelProps) => {
  const { left, center, right } = props;

  return (
    <Flex
      flex="column"
      justify="space-between"
      align="center"
      w={{ base: "100%" }}
    >
      <MemoizedLeft>{left ?? null}</MemoizedLeft>
      <MemoizedCenter>{center ?? null}</MemoizedCenter>
      <MemoizedRight>{right ?? null}</MemoizedRight>
    </Flex>
  );
};
