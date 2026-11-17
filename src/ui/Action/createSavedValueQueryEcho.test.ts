import { describe, expect, it } from "vitest"
import { createSavedValueQueryEcho } from "./createSavedValueQueryEcho"

describe("保存済み値のQuery Echo保護", () => {
  it("未保存・未編集の新しいQuery値は受け入れる", () => {
    const echo = createSavedValueQueryEcho("元の名前")
    expect(echo.observe("元の名前")).toBe(true)
    expect(echo.observe("別の名前")).toBe(true)
  })

  it("保存前の値が遅れて到着しても無視し、確定値を受け入れる", () => {
    const echo = createSavedValueQueryEcho("元の名前")
    echo.adopt("保存した名前")
    expect(echo.observe("保存した名前")).toBe(true)
    expect(echo.observe("第三の名前")).toBe(true)
  })

  it("保存後に別の新しいQuery値が届いても無期限に無視しない", () => {
    const echo = createSavedValueQueryEcho("元の名前")
    echo.adopt("保存した名前")
    expect(echo.observe("外部から変更された名前")).toBe(true)
    expect(echo.observe("元の名前")).toBe(true)
  })

  it("保存値がまだQueryで変化していない間は元の観測値を保持する", () => {
    const echo = createSavedValueQueryEcho("元の名前")
    echo.adopt("保存した名前")
    expect(echo.observe("元の名前")).toBe(false)
    expect(echo.observe("保存した名前")).toBe(true)
  })

  it("編集中に受理したQuery値は、入力を元に戻した後も同期候補となる", () => {
    const echo = createSavedValueQueryEcho("元の名前")
    expect(echo.observe("サーバーの新しい名前")).toBe(true)
    expect(echo.observe("サーバーの新しい名前")).toBe(true)
  })

  it("保存直後の古い値は、再描画で再評価しても採用しない", () => {
    const echo = createSavedValueQueryEcho("元の名前")
    echo.adopt("保存した名前")
    expect(echo.observe("元の名前")).toBe(false)
    expect(echo.observe("元の名前")).toBe(false)
    expect(echo.observe("保存した名前")).toBe(true)
  })

  it("Alias解除のnullと空文字列を混同しない", () => {
    const echo = createSavedValueQueryEcho<string | null>("元の別名")
    echo.adopt(null)
    expect(echo.observe(null)).toBe(true)
    expect(echo.observe("新しい別名")).toBe(true)
  })
})
