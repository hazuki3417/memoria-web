import { useBoolean } from "./useBoolean";

export type UseDisclosureState = {
  opend: boolean;
};

export type UseDisclosureOption = UseDisclosureState;

export interface UseDisclosureHandler {
  open: () => void;
  close: () => void;
  toggle: () => void;
  reset: () => void;
}

export interface UseDisclosure {
  state: UseDisclosureState;
  handler: UseDisclosureHandler;
}

/**
 * Modal, Dialog, Drawerの開閉状態を制御するカスタムフック
 * @param option
 * @returns
 */
export const useDisclosure = (option: UseDisclosureOption): UseDisclosure => {
  const { state, handler } = useBoolean(option.opend);

  return {
    state: { opend: state },
    handler: {
      open: handler.setTrue,
      close: handler.setFalse,
      toggle: handler.toggle,
      reset: handler.reset,
    },
  };
};
