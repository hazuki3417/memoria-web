"use client"
import "client-only"
import { useEffect, useMemo, useRef } from "react"

export interface UseIntersectionOption {
  intersect: () => void
  init?: IntersectionObserverInit
}

export const useIntersection = (option: UseIntersectionOption) => {
  const intersect = useRef(option.intersect)

  useEffect(() => {
    intersect.current = option.intersect
  }, [option.intersect])

  const ref = useMemo(() => {
    return (node: Element | null) => {
      if (!node) return

      const observer = new IntersectionObserver((entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          intersect.current()
        }
      }, option.init ?? { rootMargin: "400px" })

      observer.observe(node)

      return () => observer.disconnect()
    }
  }, [option.init])

  return { ref }
}
