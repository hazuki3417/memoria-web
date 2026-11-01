import type { ComponentPropsWithoutRef } from "react"
import styles from "../ActionPanel.module.css"
type SlotProps = ComponentPropsWithoutRef<"div">

export function End({ className, ...props }: SlotProps) {
  return (
    <div
      className={[styles.end, className].filter(Boolean).join(" ")}
      {...props}
    />
  )
}
