import { Box, Flex } from "@mantine/core";
import type { ComponentProps } from "react";
import { styles } from "./styles";
import React from "react";

type HeaderProps = ComponentProps<"header"> & {
  left: React.ReactNode;
  right: React.ReactNode;
};

const Header = (props: HeaderProps) => {
  const { left, right, ...rest } = props;

  return (
    <Box
      component="header"
      h={`${styles.HEADER_HEIGHT}px`}
      pl={"lg"}
      pr={"lg"}
      style={{
        backgroundColor: "var(--mantine-color-dark-8)",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
      }}
      {...rest}
    >
      <Flex gap={8} style={{ alignItems: "center" }}>
        {left}
      </Flex>
      <Flex gap={8} style={{ alignItems: "center" }}>
        {right}
      </Flex>
    </Box>
  );
};

export { type HeaderProps, Header };
