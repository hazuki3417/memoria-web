import { Mapper } from "./types"

/**
 * 単一要素の安全な変換
 * null/undefined の場合は null を返す
 */
export const mapItem = <T, R>(
  item: T | null | undefined,
  mapper: Mapper<T, R>,
): R | null => {
  if (item == null) return null
  return mapper(item)
}

/**
 * 配列の安全な変換
 * null/undefined の場合は空配列を返す
 */
export const mapItems = <T, R>(
  items: T[] | null | undefined,
  mapper: Mapper<T, R>,
): R[] => {
  if (!items) return []
  return items.map(mapper)
}
