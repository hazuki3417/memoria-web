import { renderHook, act } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { useSlider, UseSliderOption, UseSliderState } from "./useSlider";

describe("useSlider", () => {
  const createInitialState = (): UseSliderOption => ({
    value: 5,
    config: {
      step: 2,
      min: 0,
      max: 10,
    },
  });

  it("should initialize with correct value", () => {
    const { result } = renderHook(() => useSlider(createInitialState()));

    expect(result.current.state.value).toBe(5);
    expect(result.current.state.config).toEqual({
      step: 2,
      min: 0,
      max: 10,
    });
  });

  it("should increment correctly with clamp", () => {
    const { result } = renderHook(() => useSlider(createInitialState()));

    act(() => {
      result.current.handler.up();
    });

    expect(result.current.state.value).toBe(7);
  });

  it("should clamp to max when increment exceeds max", () => {
    const initial = {
      value: 9,
      config: {
        step: 2,
        min: 0,
        max: 10,
      },
    };
    const { result } = renderHook(() => useSlider(initial));

    act(() => {
      result.current.handler.up();
    });

    expect(result.current.state.value).toBe(10);
  });

  it("should decrement correctly with clamp", () => {
    const { result } = renderHook(() => useSlider(createInitialState()));

    act(() => {
      result.current.handler.down();
    });

    expect(result.current.state.value).toBe(3);
  });

  it("should clamp to min when decrement goes below min", () => {
    const initial = {
      value: 1,
      config: {
        step: 2,
        min: 0,
        max: 10,
      },
    };
    const { result } = renderHook(() => useSlider(initial));

    act(() => {
      result.current.handler.down();
    });

    expect(result.current.state.value).toBe(0);
  });

  it("should change value directly with clamp", () => {
    const { result } = renderHook(() => useSlider(createInitialState()));

    act(() => {
      result.current.handler.change(8);
    });

    expect(result.current.state.value).toBe(8);
  });

  it("should clamp value when change exceeds max", () => {
    const { result } = renderHook(() => useSlider(createInitialState()));

    act(() => {
      result.current.handler.change(20);
    });

    expect(result.current.state.value).toBe(10);
  });

  it("should clamp value when change below min", () => {
    const { result } = renderHook(() => useSlider(createInitialState()));

    act(() => {
      result.current.handler.change(-5);
    });

    expect(result.current.state.value).toBe(0);
  });

  it("should reset to initial value", () => {
    const { result } = renderHook(() => useSlider(createInitialState()));

    act(() => {
      result.current.handler.change(8);
    });

    act(() => {
      result.current.handler.reset();
    });

    expect(result.current.state.value).toBe(5);
  });
});
