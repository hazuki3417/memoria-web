import { act, renderHook } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { useBoolean } from "./useBoolean";

describe("useBoolean", () => {
  it("should initialize with initial value", () => {
    const { result } = renderHook(() => useBoolean(true));

    expect(result.current.state).toBe(true);
  });

  it("should set true", () => {
    const { result } = renderHook(() => useBoolean(false));

    act(() => {
      result.current.handler.setTrue();
    });

    expect(result.current.state).toBe(true);
  });

  it("should set false", () => {
    const { result } = renderHook(() => useBoolean(true));

    act(() => {
      result.current.handler.setFalse();
    });

    expect(result.current.state).toBe(false);
  });

  it("should toggle value", () => {
    const { result } = renderHook(() => useBoolean(false));

    act(() => {
      result.current.handler.toggle();
    });

    expect(result.current.state).toBe(true);

    act(() => {
      result.current.handler.toggle();
    });

    expect(result.current.state).toBe(false);
  });

  it("should reset to initial", () => {
    const { result } = renderHook(() => useBoolean(true));

    act(() => {
      result.current.handler.setFalse();
    });
    expect(result.current.state).toBe(false);

    act(() => {
      result.current.handler.reset();
    });
    expect(result.current.state).toBe(true);
  });
});
