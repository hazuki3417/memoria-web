import { ExtractPathParams, PathParamsObject, RoutePath } from "@/types/routes"
import { QueryParams } from "@/types/url"

const QUERY = {
  PREFIX: "?",
  DELIMITER: "=",
  KEY: "q",
}

const QUERY_SCHEMA_VERSION = 1

export const resolveUriBackPath = (base: string): string => {
  const delimiter = "/"
  if (!base || base === delimiter) {
    return delimiter
  }
  const segments = base.split(delimiter).filter(Boolean)

  if (segments.length <= 1) {
    return delimiter
  }
  return delimiter + segments.slice(0, -1).join(delimiter)
}

export const resolveUriPath = <Path extends RoutePath>(
  base: Path,
  path: PathParamsObject<Path> | undefined,
): string => {
  let result = base as string
  if (path) {
    for (const [key, value] of Object.entries(path)) {
      result = result.replace(`:${key}`, value as string)
    }
  }
  return result
}

export const resolveUriQuery = (query?: QueryParams): string => {
  if (!query) return ""

  const param = encodeUriQuery(query)
  return `${QUERY.PREFIX}${QUERY.KEY}${QUERY.DELIMITER}${param}`
}

export type ResolveUriOption<Path extends string> =
  ExtractPathParams<Path> extends never
    ? {
        path?: undefined
        query?: QueryParams
      }
    : {
        path: PathParamsObject<Path>
        query?: QueryParams
      }

export const resolveUri = <Path extends RoutePath>(
  base: Path,
  option?: ResolveUriOption<Path>,
): string => {
  const { path, query } = option ?? {}

  const uriStr = resolveUriPath(base, path)
  const queryStr = resolveUriQuery(query)

  return `${uriStr}${queryStr}`
}

export const isParamSegment = (segment: string) => segment.startsWith(":")

const encodeUriQuery = <T extends QueryParams>(value: T): string => {
  const json = JSON.stringify({
    version: QUERY_SCHEMA_VERSION,
    payload: value,
  })

  return btoa(encodeURIComponent(json))
}

const decodeUriQuery = <T extends QueryParams>(value: string): T | {} => {
  try {
    const json = decodeURIComponent(atob(value))
    const parsed = JSON.parse(json)

    if (parsed?.version !== QUERY_SCHEMA_VERSION) {
      console.error("unsupported version.")
    }
    return parsed.payload as T
  } catch {
    return {}
  }
}

export const uri = {
  query: {
    prefix: QUERY.PREFIX,
    delimiter: QUERY.DELIMITER,
    key: QUERY.KEY,
    encode: encodeUriQuery,
    decode: decodeUriQuery,
  },
}
