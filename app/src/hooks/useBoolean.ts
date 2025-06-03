import { booleanReducer } from "@/reducers";
import { useReducer } from "react";

export interface UseBoolean {
	state: boolean;
	setTrue: () => void;
	setFalse: () => void;
	toggle: () => void;
	reset: () => void;
}

export const useBoolean = (initial: boolean): UseBoolean => {
	const [state, dispatch] = useReducer(booleanReducer, {
		value: initial,
		initial: initial,
	});

	return {
		state: state.value,
		setTrue: () => dispatch({ type: "true" }),
		setFalse: () => dispatch({ type: "false" }),
		toggle: () => dispatch({ type: "toggle" }),
		reset: () => dispatch({ type: "reset" }),
	};
};
