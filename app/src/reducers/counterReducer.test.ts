import { describe, it, expect } from "vitest";
import { counterReducer, DEFAULT } from "./counterReducer"; // ここはファイル名に合わせて変更

describe("counterReducer", () => {
	it("should increment with default step", () => {
		const result = counterReducer(
			{
				current: { value: 10 },
				initial: { value: 0 },
				config: {},
			},
			{ type: "increment" },
		);
		expect(result).toEqual({ value: 10 + DEFAULT.CONFIG.STEP, success: true });
	});

	it("should increment with provided step", () => {
		const result = counterReducer(
			{
				current: { value: 5 },
				initial: { value: 0 },
				config: {},
			},
			{ type: "increment", step: 3 },
		);
		expect(result).toEqual({ value: 5 + 3, success: true });
	});

	it("should decrement with default step", () => {
		const result = counterReducer(
			{
				current: { value: 10 },
				initial: { value: 0 },
				config: {},
			},
			{ type: "decrement" },
		);
		expect(result).toEqual({ value: 10 - DEFAULT.CONFIG.STEP, success: true });
	});

	it("should decrement with provided step", () => {
		const result = counterReducer(
			{
				current: { value: 5 },
				initial: { value: 0 },
				config: {},
			},
			{ type: "decrement", step: 2 },
		);
		expect(result).toEqual({ value: 5 - 2, success: true });
	});

	it("should reset to initial value", () => {
		const result = counterReducer(
			{
				current: { value: 100 },
				initial: { value: 20 },
				config: {},
			},
			{ type: "reset" },
		);
		expect(result).toEqual({ value: 20, success: true });
	});

	it("should reset to DEFAULT.INITIAL.VALUE if initial value not provided", () => {
		const result = counterReducer(
			{
				current: { value: 100 },
				initial: {},
				config: {},
			},
			{ type: "reset" },
		);
		expect(result).toEqual({ value: DEFAULT.INITIAL.VALUE, success: true });
	});

	it("should fail if increment exceeds max", () => {
		const result = counterReducer(
			{
				current: { value: 10 },
				initial: { value: 0 },
				config: { max: 12 },
			},
			{ type: "increment", step: 3 },
		);
		expect(result).toEqual({ value: 13, success: false });
	});

	it("should fail if decrement below min", () => {
		const result = counterReducer(
			{
				current: { value: 10 },
				initial: { value: 0 },
				config: { min: 8 },
			},
			{ type: "decrement", step: 3 },
		);
		expect(result).toEqual({ value: 7, success: false });
	});

	it("should throw on unhandled action type", () => {
		expect(() => {
			counterReducer(
				{
					current: { value: 10 },
					initial: { value: 0 },
					config: {},
				},
				// @ts-expect-error: intentionally testing invalid action
				{ type: "unknown" },
			);
		}).toThrow();
	});
});
