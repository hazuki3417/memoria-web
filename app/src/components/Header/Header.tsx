"use client";
import { Box, Flex } from "@mantine/core";
import type { ComponentProps } from "react";
import { styles } from "./styles";
import { LangSelect } from "./LangSelect";
import { SiginInButton } from "./SignInButton";

type HeaderProps = ComponentProps<"header"> & {};

const Header = (props: HeaderProps) => (
  <Box
    component="header"
    h={`${styles.HEADER_HEIGHT}px`}
    pl={"lg"}
    pr={"lg"}
    style={(theme) => ({
      position: "flex",
      top: 0,
      left: 0,
      right: 0,
      zIndex: 1000,
      backgroundColor: theme.colors.dark[8],
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
    })}
    {...props}
  >
    <Flex gap={8}>
      <span>Memoria ver.β</span>
    </Flex>
    <Flex gap={8}>
      <LangSelect />
      <SiginInButton size="xs" />
    </Flex>
  </Box>
);

export { type HeaderProps, Header };
