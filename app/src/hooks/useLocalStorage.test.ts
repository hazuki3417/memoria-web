import { renderHook, act } from "@testing-library/react";
import { useLocalStorage } from "./useLocalStorage";
import { describe, it, expect, beforeEach } from "vitest";

beforeEach(() => {
  localStorage.clear();
});

describe("useLocalStorage", () => {
  it("should initialize with default value when no localStorage key exists", () => {
    const { result } = renderHook(() =>
      useLocalStorage({ key: "testKey", init: "default" }),
    );

    expect(result.current.state.value).toBe("default");
  });

  it("should read from localStorage if value exists", () => {
    localStorage.setItem("testKey", JSON.stringify("saved"));

    const { result } = renderHook(() =>
      useLocalStorage({ key: "testKey", init: "default" }),
    );

    expect(result.current.state.value).toBe("saved");
  });

  it("should update value and reflect it in localStorage", () => {
    const { result } = renderHook(() =>
      useLocalStorage({ key: "testKey", init: 1 }),
    );

    act(() => {
      result.current.handler.set(42);
    });

    expect(result.current.state.value).toBe(42);
    expect(JSON.parse(localStorage.getItem("testKey")!)).toBe(42);
  });

  it("should reset to initial value", () => {
    const { result } = renderHook(() =>
      useLocalStorage({ key: "testKey", init: 10 }),
    );

    act(() => {
      result.current.handler.set(99);
    });

    expect(result.current.state.value).toBe(99);

    act(() => {
      result.current.handler.reset();
    });

    expect(result.current.state.value).toBe(10);
    expect(JSON.parse(localStorage.getItem("testKey")!)).toBe(10);
  });

  it("should get the current value using get()", () => {
    const { result } = renderHook(() =>
      useLocalStorage({ key: "testKey", init: "value" }),
    );

    expect(result.current.handler.get()).toBe("value");

    act(() => {
      result.current.handler.set("updated");
    });

    expect(result.current.handler.get()).toBe("updated");
  });
});
