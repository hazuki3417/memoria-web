import { describe, expect, it } from "vitest"
import {
  imageRotateReducer,
  ImageRotateAction,
  ImageRotateState,
} from "./imageRotateReducer"

describe("imageRotateReducer", () => {
  it("rotates left by 90 degrees", () => {
    const state: ImageRotateState = {
      current: { angle: 0 },
      initial: { angle: 0 },
      meta: { action: "idle" },
    }
    const next = imageRotateReducer(state, { type: "left" })
    expect(next.current.angle).toBe(-90)
  })

  it("rotates right by 90 degrees", () => {
    const state: ImageRotateState = {
      current: { angle: 0 },
      initial: { angle: 0 },
      meta: { action: "idle" },
    }
    const next = imageRotateReducer(state, { type: "right" })
    expect(next.current.angle).toBe(90)
  })

  it("resets to initial value", () => {
    const state: ImageRotateState = {
      current: { angle: 180 },
      initial: { angle: 0 },
      meta: { action: "idle" },
    }
    const next = imageRotateReducer(state, { type: "reset" })
    expect(next.current.angle).toBe(0)
  })

  it("throws on unknown action type", () => {
    const state: ImageRotateState = {
      current: { angle: 0 },
      initial: { angle: 0 },
      meta: { action: "idle" },
    }

    expect(() =>
      imageRotateReducer(
        state,
        // @ts-expect-error: intentionally testing invalid action
        { type: "unknown" } as ImageRotateAction,
      ),
    ).toThrowError("Unhandled action type: unknown")
  })
})
