"use client";
import { Box } from "@mantine/core";
import type { ComponentProps } from "react";
import { styles } from "./styles";

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
    })}
    {...props}
  >
    <span>Memoria ver.β</span>
  </Box>
);

export { type HeaderProps, Header };
