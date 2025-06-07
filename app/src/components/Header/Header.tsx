import { Box, Container } from "@mantine/core";
import type { ComponentProps } from "react";

type HeaderProps = ComponentProps<"header"> & {};

const Header = (props: HeaderProps) => (
  <Box component="header" {...props}>
    <Container>
      <Box>Memoria ver.β</Box>
    </Container>
  </Box>
);

export { type HeaderProps, Header };
