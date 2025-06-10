import { Image } from "@mantine/core";
import type React from "react";

export type PreviewUi = {
  scale: number;
  rotate: number;
};

export interface PreviewProps {
  ui: PreviewUi;
}

export const Preview = (props: PreviewProps) => {
  const { ui } = props;

  return (
    <Image
      src="sample/h.png"
      alt="表示画像"
      style={{
        maxHeight: "100%",
        maxWidth: "100%",
        objectFit: "contain",
        transform: `rotate(${ui.rotate}deg) scale(${ui.scale})`,
        transition: "transform 0.3s ease",
      }}
    />
  );
};
