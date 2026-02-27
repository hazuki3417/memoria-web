import { describe, expect, it } from "vitest"
import { type BooleanAction, booleanReducer } from "./booleanReducer"

describe("booleanReducer", () => {
  it("should handle 'true' action", () => {
    const state = { current: { value: false }, initial: { value: false } }
    const actual = booleanReducer(state, { type: "true" })

    const expected = {
      ...state,
      current: { value: true },
    }

    expect(actual).toEqual(expected)
  })

  it("should handle 'false' action", () => {
    const state = { current: { value: true }, initial: { value: true } }
    const actual = booleanReducer(state, { type: "false" })

    const expected = {
      ...state,
      current: { value: false },
    }

    expect(actual).toEqual(expected)
  })

  it("should handle 'toggle' action from true to false", () => {
    const state = { current: { value: true }, initial: { value: false } }
    const actual = booleanReducer(state, { type: "toggle" })

    const expected = {
      ...state,
      current: { value: false },
    }

    expect(actual).toEqual(expected)
  })

  it("should handle 'toggle' action from false to true", () => {
    const state = { current: { value: false }, initial: { value: true } }
    const actual = booleanReducer(state, { type: "toggle" })

    const expected = {
      ...state,
      current: { value: true },
    }

    expect(actual).toEqual(expected)
  })

  it("should handle 'reset' action", () => {
    const state = { current: { value: true }, initial: { value: false } }
    const actual = booleanReducer(state, { type: "reset" })

    const expected = {
      ...state,
      current: { value: state.initial.value },
    }

    expect(actual).toEqual(expected)
  })

  it("should throw error on unknown action type", () => {
    const state = { current: { value: true }, initial: { value: false } }

    expect(() => {
      booleanReducer(
        state,
        // @ts-expect-error: intentionally testing invalid action
        { type: "unknown" } as BooleanAction,
      )
    }).toThrowError("Unhandled action type: unknown")
  })
})
