"use client"

import { useEffect, useRef } from "react"

/** Triggers another page when the end of a scrollable collection approaches. */
export function LoadMoreSentinel({ onVisible }: { onVisible?: () => void }) {
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    if (!onVisible || !ref.current || typeof IntersectionObserver === "undefined") return
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) onVisible() },
      { rootMargin: "160px" },
    )
    observer.observe(ref.current)
    return () => observer.disconnect()
  }, [onVisible])
  return <div ref={ref} aria-hidden="true" style={{ height: 1 }} />
}
