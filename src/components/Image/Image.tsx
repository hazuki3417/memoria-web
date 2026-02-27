import React from "react"
import { ImageFrame } from "./ImageFrame"
import { ImageTile } from "./ImageTile"
import { IntersectionTile } from "./IntersectionTile"

export interface ImageProps {
  children: React.ReactNode
}

export const Image = (props: ImageProps) => {
  const { children } = props
  return <>{children}</>
}

Image.Frame = ImageFrame
Image.Tile = ImageTile
Image.Intersection = IntersectionTile
