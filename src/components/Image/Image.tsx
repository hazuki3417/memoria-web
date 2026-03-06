import React from "react"
import { IntersectionTile } from "./IntersectionTile"

export interface ImageProps {
  children: React.ReactNode
}

export const Image = (props: ImageProps) => {
  const { children } = props
  return <>{children}</>
}

Image.Intersection = IntersectionTile
