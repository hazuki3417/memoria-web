"use client"
import "client-only"
import { useEffect, useMemo, useRef } from "react"

export interface UseIntersectionOption {
  intersect: () => void
  init?: IntersectionObserverInit
}

export const useIntersection = (option: UseIntersectionOption) => {
  const ref = useRef(null)
  const intersect = useRef(option.intersect)

  const init = useMemo(
    () => option.init ?? { root: null, rootMargin: "400px", threshold: 0.1 },
    [option.init],
  )

  useEffect(() => {
    intersect.current = option.intersect
  }, [option.intersect])

  useEffect(() => {
    if (!ref.current) return

    const observer = new IntersectionObserver((entries) => {
      if (entries.some((event) => event.isIntersecting)) {
        intersect.current()
      }
    }, init)

    observer.observe(ref.current)
    return () => observer.disconnect()
  }, [init])

  return { ref }
}
