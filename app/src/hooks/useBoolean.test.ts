import { describe, it, expect } from "vitest";
import { act, renderHook } from "@testing-library/react";
import { useBoolean } from "./useBoolean";

describe("useBoolean", () => {
	it("should initialize with initial value", () => {
		const { result } = renderHook(() => useBoolean(true));

		expect(result.current.state).toBe(true);
	});

	it("should set true", () => {
		const { result } = renderHook(() => useBoolean(false));

		act(() => {
			result.current.setTrue();
		});

		expect(result.current.state).toBe(true);
	});

	it("should set false", () => {
		const { result } = renderHook(() => useBoolean(true));

		act(() => {
			result.current.setFalse();
		});

		expect(result.current.state).toBe(false);
	});

	it("should toggle value", () => {
		const { result } = renderHook(() => useBoolean(false));

		act(() => {
			result.current.toggle();
		});

		expect(result.current.state).toBe(true);

		act(() => {
			result.current.toggle();
		});

		expect(result.current.state).toBe(false);
	});

	it("should reset to initial", () => {
		const { result } = renderHook(() => useBoolean(true));

		act(() => {
			result.current.setFalse();
		});
		expect(result.current.state).toBe(false);

		act(() => {
			result.current.reset();
		});
		expect(result.current.state).toBe(true);
	});
});
