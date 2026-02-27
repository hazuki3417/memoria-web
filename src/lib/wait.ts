/**
 * 指定した秒数だけ待機する
 * @param seconds 待機秒数
 */
export const wait = (seconds: number): Promise<void> => {
  return new Promise((resolve) => {
    setTimeout(resolve, seconds * 1000)
  })
}
