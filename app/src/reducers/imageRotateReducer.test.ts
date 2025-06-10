import { describe, expect, it } from "vitest";
import { imageRotateReducer, ImageRotateAction } from "./imageRotateReducer";

describe("imageRotateReducer", () => {
  it("rotates left by 90 degrees", () => {
    const state = {
      current: { value: 0 },
      initial: { value: 0 },
    };
    const nextState = imageRotateReducer(state, { type: "left" });
    expect(nextState.current.value).toBe(-90);
  });

  it("rotates right by 90 degrees", () => {
    const state = {
      current: { value: 0 },
      initial: { value: 0 },
    };
    const nextState = imageRotateReducer(state, { type: "right" });
    expect(nextState.current.value).toBe(90);
  });

  it("resets to initial value", () => {
    const state = {
      current: { value: 180 },
      initial: { value: 0 },
    };
    const nextState = imageRotateReducer(state, { type: "reset" });
    expect(nextState.current.value).toBe(0);
  });

  it("throws on unknown action type", () => {
    const state = {
      current: { value: 0 },
      initial: { value: 0 },
    };

    expect(() =>
      imageRotateReducer(
        state,
        // @ts-expect-error: intentionally testing invalid action
        { type: "unknown" } as ImageRotateAction,
      ),
    ).toThrowError("Unhandled action type: unknown");
  });
});
