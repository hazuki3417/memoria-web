"use client";
import { Box, Flex } from "@mantine/core";
import type { ComponentProps } from "react";
import { styles } from "./styles";
import React from "react";

import { LangSelect } from "./LangSelect";
import { Auth } from "@/components/Auth/Csr";
import { UserMenu } from "./UserMenu";
import { SiginInButton } from "./SignInButton";

export type HeaderProps = ComponentProps<"header"> & {};

export const Header = (props: HeaderProps) => {
  const { ...rest } = props;

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
        <span>Memoria ver.β</span>
      </Flex>
      <Flex gap={8} style={{ alignItems: "center" }}>
        <LangSelect />
        <Auth>
          <Auth.SignedIn>
            <UserMenu />
          </Auth.SignedIn>
          <Auth.SignedOut>
            <SiginInButton size="xs" />
          </Auth.SignedOut>
        </Auth>
      </Flex>
    </Box>
  );
};
