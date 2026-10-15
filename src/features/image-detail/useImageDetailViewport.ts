"use client"

import { useState } from "react"

/**
 * Image Detail viewport state shared by the application and its visual prototype.
 * Keep transitions and defaults aligned with the existing Media Detail contract.
 */
export function useImageDetailViewport() {
  const [detailInfoOpened, setDetailInfoOpened] = useState(true)
  const [detailZoom, setDetailZoom] = useState(100)
  const [detailRotate, setDetailRotate] = useState(0)
  const [detailRotateAnimated, setDetailRotateAnimated] = useState(true)
  const [detailDirection, setDetailDirection] = useState<-1 | 1>(1)
  const prepareNavigation = (direction: -1 | 1) => {
    setDetailDirection(direction)
    setDetailZoom(100)
    setDetailRotateAnimated(false)
    setDetailRotate(0)
  }
  return {
    prepareNavigation,
    detailInfoOpened,
    setDetailInfoOpened,
    detailZoom,
    setDetailZoom,
    detailRotate,
    setDetailRotate,
    detailRotateAnimated,
    setDetailRotateAnimated,
    detailDirection,
    setDetailDirection,
  }
}
