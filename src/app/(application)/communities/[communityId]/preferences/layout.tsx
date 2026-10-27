import type { ReactNode } from "react"
import { StandardPageScroll } from "@/components/StandardPageScroll/StandardPageScroll"

export default function PageLayout({ children }: { children: ReactNode }) {
  return <StandardPageScroll>{children}</StandardPageScroll>
}
