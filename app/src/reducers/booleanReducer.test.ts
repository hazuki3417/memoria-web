import { describe, expect, it } from "vitest";
import {
  type BooleanAction,
  BooleanState,
  booleanReducer,
} from "./booleanReducer"; // ファイル名に合わせて修正

describe("booleanReducer", () => {
  it("should handle 'true' action", () => {
    const actual = booleanReducer(
      { current: { value: false }, initial: { value: false } },
      { type: "true" },
    );
    expect(actual).toEqual({
      current: { value: true },
      initial: { value: false },
    });
  });

  it("should handle 'false' action", () => {
    const actual = booleanReducer(
      { current: { value: true }, initial: { value: true } },
      { type: "false" },
    );
    expect(actual).toEqual({
      current: { value: false },
      initial: { value: true },
    });
  });

  it("should handle 'toggle' action from true to false", () => {
    const actual = booleanReducer(
      { current: { value: true }, initial: { value: false } },
      { type: "toggle" },
    );
    expect(actual).toEqual({
      current: { value: false },
      initial: { value: false },
    });
  });

  it("should handle 'toggle' action from false to true", () => {
    const actual = booleanReducer(
      { current: { value: false }, initial: { value: true } },
      { type: "toggle" },
    );
    expect(actual).toEqual({
      current: { value: true },
      initial: { value: true },
    });
  });

  it("should handle 'reset' action", () => {
    const actual = booleanReducer(
      { current: { value: true }, initial: { value: false } },
      { type: "reset" },
    );
    expect(actual).toEqual({
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
    }).toThrowError("Unhandled action type: unknown");
  });
});
