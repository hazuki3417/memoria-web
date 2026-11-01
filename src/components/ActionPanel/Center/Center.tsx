import type { ComponentPropsWithoutRef } from "react"
import styles from "../ActionPanel.module.css"
type SlotProps = ComponentPropsWithoutRef<"div">

export function Center({ className, ...props }: SlotProps) {
  return (
    <div
      className={[styles.center, className].filter(Boolean).join(" ")}
      {...props}
    />
  )
}
