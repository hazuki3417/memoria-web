export type ApplicationContextOption = {
  id: string
  kind: "personal" | "community"
  label: string
  accentColor: string
}

// 移行期間中の既存import互換。型の所有者はApplicationNavigationContent。
export type { ApplicationNavigationItem } from "./ApplicationNavigationContent"
