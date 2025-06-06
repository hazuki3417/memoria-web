import { describe, it, expect } from "vitest";
import { act, renderHook } from "@testing-library/react";
import { useDisclosure } from "./useDisclosure";

describe("useDisclosure", () => {
	it("should initialize with initial value", () => {
		const { result } = renderHook(() => useDisclosure({ opend: true }));

		expect(result.current.state.opend).toBe(true);
	});

	it("should set open", () => {
		const { result } = renderHook(() => useDisclosure({ opend: false }));

		act(() => {
			result.current.handler.open();
		});

		expect(result.current.state.opend).toBe(true);
	});

	it("should set close", () => {
		const { result } = renderHook(() => useDisclosure({ opend: true }));

		act(() => {
			result.current.handler.close();
		});

		expect(result.current.state.opend).toBe(false);
	});

	it("should toggle value", () => {
		const { result } = renderHook(() => useDisclosure({ opend: false }));

		act(() => {
			result.current.handler.toggle();
		});

		expect(result.current.state.opend).toBe(true);

		act(() => {
			result.current.handler.toggle();
		});

		expect(result.current.state.opend).toBe(false);
	});

	it("should reset to initial", () => {
		const { result } = renderHook(() => useDisclosure({ opend: true }));

		act(() => {
			result.current.handler.close();
		});
		expect(result.current.state.opend).toBe(false);

		act(() => {
			result.current.handler.reset();
		});
		expect(result.current.state.opend).toBe(true);
	});
});
