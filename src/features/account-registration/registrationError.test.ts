import { describe, expect, it } from "vitest"
import { isBlockingRegistrationError } from "./registrationError"

describe("登録時の認証エラー判定", () => {
  it("401またはUNAUTHENTICATEDを継続不能として扱う", () => {
    expect(isBlockingRegistrationError({ networkError: { statusCode: 401 } })).toBe(true)
    expect(isBlockingRegistrationError({ graphQLErrors: [{ extensions: { code: "UNAUTHENTICATED" } }] })).toBe(true)
  })

  it("一時障害と予期しないエラーを通常の失敗に分類する", () => {
    expect(isBlockingRegistrationError({ networkError: { statusCode: 500 } })).toBe(false)
    expect(isBlockingRegistrationError({ graphQLErrors: [{ extensions: { code: "CONFLICT" } }] })).toBe(false)
    expect(isBlockingRegistrationError(new Error("offline"))).toBe(false)
    expect(isBlockingRegistrationError(null)).toBe(false)
  })
})
