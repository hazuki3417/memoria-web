"use client"

import { Box, Divider, Modal as MantineModal } from "@mantine/core"
import type { ModalProps as MantineModalProps } from "@mantine/core"
import type { ComponentPropsWithoutRef, ReactNode } from "react"
import styles from "./Modal.module.css"

type ModalProps = Omit<MantineModalProps, "children"> & {
  children: ReactNode
}

type RegionProps = ComponentPropsWithoutRef<"div">

function ModalRoot({ children, withCloseButton = false, ...props }: ModalProps) {
  return (
    <MantineModal {...props} centered withCloseButton={withCloseButton}>
      <Box tabIndex={-1} data-autofocus style={{ position: "absolute" }} />
      <div className={styles.layout}>{children}</div>
    </MantineModal>
  )
}

function ModalBody({ className, ...props }: RegionProps) {
  return <div className={[styles.body, className].filter(Boolean).join(" ")} {...props} />
}

function ModalDivider() {
  return <Divider className={styles.divider} />
}

function ModalFooter({ className, ...props }: RegionProps) {
  return <div className={[styles.footer, className].filter(Boolean).join(" ")} {...props} />
}

export const Modal = Object.assign(ModalRoot, {
  Body: ModalBody,
  Divider: ModalDivider,
  Footer: ModalFooter,
})
