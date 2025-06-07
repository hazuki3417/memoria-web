import { describe, expect, it } from "vitest";
import { type CounterAction, DEFAULT, counterReducer } from "./counterReducer"; // パスは適宜修正

describe("counterReducer", () => {
  it("should increment with default step", () => {
    const actual = counterReducer(
      {
        current: { value: 10 },
        initial: { value: 0 },
        config: {},
      },
      { type: "increment" },
    );
    expect(actual).toEqual({ value: 10 + DEFAULT.CONFIG.STEP, success: true });
  });

  it("should increment with provided step", () => {
    const actual = counterReducer(
      {
        current: { value: 5 },
        initial: { value: 0 },
        config: {},
      },
      { type: "increment", step: 3 },
    );
    expect(actual).toEqual({ value: 5 + 3, success: true });
  });

  it("should not increment if exceeds max", () => {
    const actual = counterReducer(
      {
        current: { value: 10 },
        initial: { value: 0 },
        config: { max: 12 },
      },
      { type: "increment", step: 3 },
    );
    expect(actual).toEqual({ value: 10, success: false });
  });

  it("should decrement with default step", () => {
    const actual = counterReducer(
      {
        current: { value: 10 },
        initial: { value: 0 },
        config: {},
      },
      { type: "decrement" },
    );
    expect(actual).toEqual({ value: 10 - DEFAULT.CONFIG.STEP, success: true });
  });

  it("should decrement with provided step", () => {
    const actual = counterReducer(
      {
        current: { value: 5 },
        initial: { value: 0 },
        config: {},
      },
      { type: "decrement", step: 2 },
    );
    expect(actual).toEqual({ value: 5 - 2, success: true });
  });

  it("should not decrement if falls below min", () => {
    const actual = counterReducer(
      {
        current: { value: 10 },
        initial: { value: 0 },
        config: { min: 8 },
      },
      { type: "decrement", step: 3 },
    );
    expect(actual).toEqual({ value: 10, success: false });
  });

  it("should set value within bounds", () => {
    const actual = counterReducer(
      {
        current: { value: 10 },
        initial: { value: 0 },
        config: { min: 0, max: 20 },
      },
      { type: "set", value: 15 },
    );
    expect(actual).toEqual({ value: 15, success: true });
  });

  it("should not set value if out of bounds", () => {
    const actual = counterReducer(
      {
        current: { value: 10 },
        initial: { value: 0 },
        config: { min: 0, max: 20 },
      },
      { type: "set", value: 25 },
    );
    expect(actual).toEqual({ value: 10, success: false });
  });

  it("should reset to initial value", () => {
    const actual = counterReducer(
      {
        current: { value: 100 },
        initial: { value: 20 },
        config: {},
      },
      { type: "reset" },
    );
    expect(actual).toEqual({ value: 20, success: true });
  });

  it("should reset to default if initial not specified", () => {
    const actual = counterReducer(
      {
        current: { value: 100 },
        initial: {},
        config: {},
      },
      { type: "reset" },
    );
    expect(actual).toEqual({ value: DEFAULT.INITIAL.VALUE, success: true });
  });

  it("should throw error on unknown action", () => {
    expect(() => {
      counterReducer(
        {
          current: { value: 0 },
          initial: { value: 0 },
          config: {},
        },
        // @ts-expect-error: intentionally testing invalid action
        { type: "unknown" } as CounterAction,
      );
    }).toThrowError("Unhandled action type: unknown");
  });
});
