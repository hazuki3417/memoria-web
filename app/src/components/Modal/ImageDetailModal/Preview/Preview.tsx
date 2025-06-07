import { Box, Image, type BoxProps } from "@mantine/core";
import type React from "react";

export interface PreviewProps extends BoxProps {}

export const Preview = (props: PreviewProps) => {
  const {} = props;
  return (
    <Box>
      <Image src="sample/h.png" />
    </Box>
  );
};
