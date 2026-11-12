import { describe, expect, it } from "vitest"
import { getGraphQLErrorCodes } from "./getGraphQLErrorCodes"

describe("GraphQL Error Codeの抽出", () => {
  it("extensions.codeを取得し、欠損や不正な構造をnullとして保持する", () => {
    expect(getGraphQLErrorCodes([
      { extensions: { code: "FORBIDDEN" } },
      { extensions: { code: 10 } },
      { extensions: null },
      null,
    ])).toEqual(["FORBIDDEN", null, null, null])
  })
})
