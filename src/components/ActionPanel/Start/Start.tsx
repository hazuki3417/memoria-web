import type { ComponentPropsWithoutRef } from "react"
import styles from "../ActionPanel.module.css"
type SlotProps = ComponentPropsWithoutRef<"div">

export function Start({ className, ...props }: SlotProps) {
  return (
    <div
      className={[styles.start, className].filter(Boolean).join(" ")}
      {...props}
    />
  )
}
