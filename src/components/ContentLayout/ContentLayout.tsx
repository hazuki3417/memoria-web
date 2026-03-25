"use client"
import dynamic from "next/dynamic"
import React from "react"
import { Grid } from "./Grid"
import { Slide } from "./Slide"

export interface ContentLayoutProps {
  children: React.ReactNode
}

export const ContentLayout = (props: ContentLayoutProps) => {
  const { children } = props
  return <>{children}</>
}

ContentLayout.Grid = Grid
ContentLayout.Slide = Slide
ContentLayout.Intersection = dynamic(
  () => import("./Intersection").then((mod) => mod.Intersection),
  { ssr: false },
)
