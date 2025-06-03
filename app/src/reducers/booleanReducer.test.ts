import { describe, it, expect } from "vitest";
import { booleanReducer, BooleanState, BooleanAction } from "./booleanReducer";

describe("booleanReducer", () => {
	const initialState: BooleanState = { value: false, initial: false };

	it("should set value to true", () => {
		const action: BooleanAction = { type: "true" };
		const nextState = booleanReducer(initialState, action);
		expect(nextState.value).toBe(true);
	});

	it("should set value to false", () => {
		const state: BooleanState = { value: true, initial: true };
		const action: BooleanAction = { type: "false" };
		const nextState = booleanReducer(state, action);
		expect(nextState.value).toBe(false);
	});

	it("should toggle value", () => {
		const state1: BooleanState = { value: false, initial: false };
		const state2: BooleanState = { value: true, initial: true };

		const nextState1 = booleanReducer(state1, { type: "toggle" });
		const nextState2 = booleanReducer(state2, { type: "toggle" });

		expect(nextState1.value).toBe(true);
		expect(nextState2.value).toBe(false);
	});

	it("should reset to initial", () => {
		const state: BooleanState = { value: true, initial: false };
		const nextState = booleanReducer(state, { type: "reset" });
		expect(nextState.value).toBe(false);
	});

	it("should return current state on unknown action type", () => {
		expect(() => {
			// @ts-expect-error: intentionally testing invalid action
			booleanReducer(initialState, { type: "invalid" });
		}).toThrowError("Unhandled action type: invalid");
	});
});
