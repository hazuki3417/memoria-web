"use client"
import "client-only"
import { useEffect } from "react"

export const useDebouncedEffect = (
  effect: () => void | (() => void),
  deps: ReadonlyArray<unknown>,
  delay: number,
): void => {
  let cleanup: void | (() => void)

  useEffect(() => {
    const handler = setTimeout(() => {
      cleanup = effect()
    }, delay)

    return () => {
      clearTimeout(handler)
      if (typeof cleanup === "function") {
        cleanup()
      }
    }
  }, [...deps, delay])
}
