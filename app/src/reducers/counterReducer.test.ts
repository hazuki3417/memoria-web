import { describe, expect, it } from "vitest";
import { type CounterAction, counterReducer } from "./counterReducer"; // パスは適宜修正

describe("counterReducer", () => {
  it("should increment with default step", () => {
    const state = {
      current: { value: 5 },
      initial: { value: 0 },
      config: { step: 1 },
    };
    const actual = counterReducer(state, { type: "increment" });

    const expected = {
      ...state,
      current: { value: 6 },
    };

    expect(actual).toEqual(expected);
  });

  it("should increment with provided step", () => {
    const state = {
      current: { value: 5 },
      initial: { value: 0 },
      config: { step: 1 },
    };
    const actual = counterReducer(state, { type: "increment", step: 3 });

    const expected = {
      ...state,
      current: { value: 8 },
    };

    expect(actual).toEqual(expected);
  });

  it("should decrement with default step", () => {
    const state = {
      current: { value: 10 },
      initial: { value: 0 },
      config: { step: 1 },
    };
    const actual = counterReducer(state, { type: "decrement" });

    const expected = {
      ...state,
      current: { value: 9 },
    };

    expect(actual).toEqual(expected);
  });

  it("should decrement with provided step", () => {
    const state = {
      current: { value: 10 },
      initial: { value: 0 },
      config: { step: 1 },
    };
    const actual = counterReducer(state, { type: "decrement", step: 2 });

    const expected = {
      ...state,
      current: { value: 8 },
    };

    expect(actual).toEqual(expected);
  });

  it("should reset to initial value", () => {
    const state = {
      current: { value: 100 },
      initial: { value: 20 },
      config: { step: 1 },
    };
    const actual = counterReducer(state, { type: "reset" });

    const expected = {
      ...state,
      current: { value: state.initial.value },
    };

    expect(actual).toEqual(expected);
  });

  it("should throw error on unknown action", () => {
    const state = {
      current: { value: 100 },
      initial: { value: 20 },
      config: { step: 1 },
    };

    expect(() => {
      counterReducer(
        state,
        // @ts-expect-error: intentionally testing invalid action
        { type: "unknown" } as CounterAction,
      );
    }).toThrowError("Unhandled action type: unknown");
  });
});
