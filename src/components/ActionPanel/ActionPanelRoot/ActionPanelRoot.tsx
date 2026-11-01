import type { ComponentPropsWithoutRef } from "react"
import styles from "../ActionPanel.module.css"
type SlotProps = ComponentPropsWithoutRef<"div">

export function ActionPanelRoot({ className, ...props }: SlotProps) {
  return (
    <div
      className={[styles.root, className].filter(Boolean).join(" ")}
      {...props}
    />
  )
}
