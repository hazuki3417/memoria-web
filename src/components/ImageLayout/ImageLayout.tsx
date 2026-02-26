import React from "react";
import { Grid } from "./Grid";
import { Slide } from "./Slide";

export interface ImageLayoutProps {
  children: React.ReactNode;
}

export const ImageLayout = (props: ImageLayoutProps) => {
  const { children } = props;
  return <>{children}</>;
};

ImageLayout.Grid = Grid;
ImageLayout.Slide = Slide;
