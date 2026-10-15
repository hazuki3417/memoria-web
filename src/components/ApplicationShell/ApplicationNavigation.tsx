"use client"

import { useState } from "react"

// 既存consumerとのimport互換性を維持するための移行用entry。
export { ApplicationNavigation } from "./ApplicationNavigation/ApplicationNavigation"
export { ApplicationNavigationTrigger } from "./ApplicationNavigationTrigger/ApplicationNavigationTrigger"

export function useApplicationNavigation() {
  const [opened, setOpened] = useState(false)
  return {
    opened,
    toggle: () => setOpened((value) => !value),
    close: () => setOpened(false),
  }
}
