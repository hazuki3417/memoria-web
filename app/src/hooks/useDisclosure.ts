import { useBoolean, UseBooleanHandler, UseBooleanState } from "./useBoolean";

export type UseDisclosureState = {
	opend: boolean;
};

export type UseDisclosureHandler = {
	open: () => void;
	close: () => void;
	toggle: () => void;
	reset: () => void;
};

export interface UseDisclosure {
	state: UseDisclosureState;
	handler: UseDisclosureHandler;
}

/**
 * Modal, Dialog, Drawerの開閉状態を制御するカスタムフック
 * @param initial
 * @returns
 */
export const useDisclosure = (initial: UseDisclosureState): UseDisclosure => {
	const { state, handler } = useBoolean(initial.opend);

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
