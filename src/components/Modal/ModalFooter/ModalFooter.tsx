"use client"

import type { ComponentPropsWithoutRef } from "react"
import styles from "../Modal.module.css"
type RegionProps = ComponentPropsWithoutRef<"div">

export function ModalFooter({ className, ...props }: RegionProps) {
  return (
    <div
      className={[styles.footer, className].filter(Boolean).join(" ")}
      {...props}
    />
  )
}
