"use client"

import type { ComponentPropsWithoutRef } from "react"
import styles from "../Modal.module.css"
type RegionProps = ComponentPropsWithoutRef<"div">

export function ModalBody({ className, ...props }: RegionProps) {
  return (
    <div
      className={[styles.body, className].filter(Boolean).join(" ")}
      {...props}
    />
  )
}
