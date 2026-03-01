import { describe, expect, it } from "vitest"
import { type BooleanAction, booleanReducer } from "./booleanReducer"

describe("booleanReducer", () => {
  it("should handle 'true' action", () => {
    const state = { current: false, initial: false }
    const actual = booleanReducer(state, { type: "true" })

    const expected = {
      ...state,
      current: true,
    }

    expect(actual).toEqual(expected)
  })

  it("should handle 'false' action", () => {
    const state = { current: true, initial: true }
    const actual = booleanReducer(state, { type: "false" })

    const expected = {
      ...state,
      current: false,
    }

    expect(actual).toEqual(expected)
  })

  it("should handle 'toggle' action from true to false", () => {
    const state = { current: true, initial: false }
    const actual = booleanReducer(state, { type: "toggle" })

    const expected = {
      ...state,
      current: false,
    }

    expect(actual).toEqual(expected)
  })

  it("should handle 'toggle' action from false to true", () => {
    const state = { current: false, initial: true }
    const actual = booleanReducer(state, { type: "toggle" })

    const expected = {
      ...state,
      current: true,
    }

    expect(actual).toEqual(expected)
  })

  it("should handle 'reset' action", () => {
    const state = { current: true, initial: false }
    const actual = booleanReducer(state, { type: "reset" })

    const expected = {
      ...state,
      current: state.initial,
    }

    expect(actual).toEqual(expected)
  })

  it("should throw error on unknown action type", () => {
    const state = { current: true, initial: false }

    expect(() => {
      booleanReducer(
        state,
        // @ts-expect-error: intentionally testing invalid action
        { type: "unknown" } as BooleanAction,
      )
    }).toThrowError("Unhandled action type: unknown")
  })
})
