import { describe, it, expect } from "vitest";
import { booleanReducer, BooleanState, BooleanAction } from "./booleanReducer"; // ファイル名に合わせて修正

describe("booleanReducer", () => {
	it("should handle 'true' action", () => {
		const result = booleanReducer(
			{ current: { value: false }, initial: { value: false } },
			{ type: "true" },
		);
		expect(result).toEqual({
			current: { value: true },
			initial: { value: false },
		});
	});

	it("should handle 'false' action", () => {
		const result = booleanReducer(
			{ current: { value: true }, initial: { value: true } },
			{ type: "false" },
		);
		expect(result).toEqual({
			current: { value: false },
			initial: { value: true },
		});
	});

	it("should handle 'toggle' action from true to false", () => {
		const result = booleanReducer(
			{ current: { value: true }, initial: { value: false } },
			{ type: "toggle" },
		);
		expect(result).toEqual({
			current: { value: false },
			initial: { value: false },
		});
	});

	it("should handle 'toggle' action from false to true", () => {
		const result = booleanReducer(
			{ current: { value: false }, initial: { value: true } },
			{ type: "toggle" },
		);
		expect(result).toEqual({
			current: { value: true },
			initial: { value: true },
		});
	});

	it("should handle 'reset' action", () => {
		const result = booleanReducer(
			{ current: { value: true }, initial: { value: false } },
			{ type: "reset" },
		);
		expect(result).toEqual({
			current: { value: false },
			initial: { value: false },
		});
	});

	it("should throw error on unknown action type", () => {
		expect(() => {
			booleanReducer(
				{ current: { value: true }, initial: { value: false } },
				// @ts-expect-error: intentionally testing invalid action
				{ type: "unknown" } as BooleanAction,
			);
		}).toThrow();
	});
});
