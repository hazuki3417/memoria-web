"use client"
import { useEffect } from "react"

export type UseImagePreloadArgs = {
  targets: string[]
}

export function useImagePreload(args: UseImagePreloadArgs) {
  const { targets } = args
  useEffect(() => {
    targets.forEach((src) => {
      if (!src) return
      const img = new Image()
      img.src = src
    })
  }, [targets])
}
