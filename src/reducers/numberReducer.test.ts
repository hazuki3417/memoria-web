import { describe, expect, it } from "vitest"
import { type NumberAction, numberReducer } from "./numberReducer" // パスは適宜修正

describe("numberReducer", () => {
  it("should reset to initial value", () => {
    const state = {
      current: { value: 100 },
      initial: { value: 20 },
      config: { step: 1 },
    }
    const actual = numberReducer(state, { type: "reset" })

    const expected = {
      ...state,
      current: { value: state.initial.value },
    }

    expect(actual).toEqual(expected)
  })

  it("should throw error on unknown action", () => {
    const state = {
      current: { value: 100 },
      initial: { value: 20 },
      config: { step: 1 },
    }

    expect(() => {
      numberReducer(
        state,
        // @ts-expect-error: intentionally testing invalid action
        { type: "unknown" } as NumberAction,
      )
    }).toThrowError("Unhandled action type: unknown")
  })
})
