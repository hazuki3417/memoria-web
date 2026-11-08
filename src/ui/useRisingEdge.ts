"use client"

import { useEffect, useRef } from "react"

/** Invoke a callback once for each false -> true transition, including an initially true value. */
export function useRisingEdge(value: boolean, onRise: () => void) {
  const previous = useRef(false)
  useEffect(() => {
    if (value && !previous.current) onRise()
    previous.current = value
  }, [value, onRise])
}
