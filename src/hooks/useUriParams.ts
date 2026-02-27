import "client-only"
import { useParams } from "next/navigation"

/**
 * Next.js useParams が返す生の型
 */
export type RawUriParams = Record<string, string | string[] | undefined>

/**
 * useUriParams のオプション
 */
export type UseUriParamsOption<T> = {
  /**
   * 生の params をアプリ用に変換する関数
   * 指定しなければ raw をそのまま返す
   */
  normalize?: (raw: RawUriParams) => T
}

/**
 * URI path params を取得するアプリ用 hook
 *
 * - useParams を直接使わないための境界
 * - normalize を差し込める
 * - ジェネリクスで返却型を指定できる
 */
export const useUriParams = <T extends Record<string, any> = RawUriParams>(
  option?: UseUriParamsOption<T>,
): T => {
  const raw = useParams() as RawUriParams

  if (option?.normalize) {
    return option.normalize(raw)
  }

  // normalize 未指定時は raw をそのまま返す
  return raw as unknown as T
}
