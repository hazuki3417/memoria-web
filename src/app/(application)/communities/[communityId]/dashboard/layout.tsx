import type { ReactNode } from "react"
import { ApplicationContentScroll } from "@/components/ApplicationShell"

/** Route-owned scroll region; the shared ApplicationShell does not prescribe page scrolling. */
export default function PageScrollLayout({ children }: { children: ReactNode }) {
  return <ApplicationContentScroll>{children}</ApplicationContentScroll>
}
