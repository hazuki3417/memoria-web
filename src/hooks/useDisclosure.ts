import { useBoolean } from "./useBoolean"

export type UseDisclosureStatus = "opened" | "closed"

export interface UseDisclosureOption {
  status: UseDisclosureStatus
}

export interface UseDisclosureValue {
  status: UseDisclosureStatus
}

export interface UseDisclosureControl {
  open: () => void
  close: () => void
  toggle: () => void
  reset: () => void
}

// export interface UseDisclosureAction {

// }

export interface UseDisclosure {
  value: UseDisclosureValue
  control: UseDisclosureControl
  // action: UseDisclosureAction
}

/**
 * Modal, Dialog, Drawerの開閉状態を制御するカスタムフック
 * @param option
 * @returns
 */
export const useDisclosure = (option?: UseDisclosureOption): UseDisclosure => {
  const { status = "closed" } = option ?? {}
  const { value, control } = useBoolean(status === "opened")

  return {
    value: { status: value ? "opened" : "closed" },
    control: {
      open: control.setTrue,
      close: control.setFalse,
      toggle: control.toggle,
      reset: control.reset,
    },
  }
}
