"use client"

import { ModalRoot } from "./ModalRoot"
import { ModalBody } from "./ModalBody"
import { ModalDivider } from "./ModalDivider"
import { ModalFooter } from "./ModalFooter"

export const Modal = Object.assign(ModalRoot, {
  Body: ModalBody,
  Divider: ModalDivider,
  Footer: ModalFooter,
})
