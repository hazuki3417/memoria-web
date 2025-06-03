export interface BooleanState {
	value: boolean;
	initial: boolean;
}

export type BooleanAction =
	| { type: "true" }
	| { type: "false" }
	| { type: "toggle" }
	| { type: "reset" };

export const booleanReducer = (
	state: BooleanState,
	action: BooleanAction,
): BooleanState => {
	switch (action.type) {
		case "true":
			return { ...state, value: true };
		case "false":
			return { ...state, value: false };
		case "toggle":
			return { ...state, value: !state.value };
		case "reset":
			return { ...state, value: state.initial };
		default:
			throw new Error(`Unhandled action type: ${(action as any).type}`);
	}
};
