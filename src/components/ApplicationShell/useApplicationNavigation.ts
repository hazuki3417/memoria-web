"use client"

import { useState } from "react"

export function useApplicationNavigation() {
  const [opened, setOpened] = useState(false)
  return {
    opened,
    toggle: () => setOpened((value) => !value),
    close: () => setOpened(false),
  }
}
