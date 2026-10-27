import type { ViewportCategory } from "./useResponsiveViewport"

/** The wider matching breakpoint takes precedence. */
export function classifyViewport(
  isAtLeastSm: boolean,
  isAtLeastXl: boolean,
): ViewportCategory {
  if (isAtLeastXl) return "wide"
  if (isAtLeastSm) return "medium"
  return "compact"
}
