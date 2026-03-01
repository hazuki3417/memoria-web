"use client"
import { uri } from "@/lib/url"
import { QueryParams } from "@/types/url"
import "client-only"
import { useSearchParams } from "next/navigation"

type UseUriQueryOption<T> = {
  normalize?: (raw: QueryParams) => T
}

export const useUriQuery = <T extends QueryParams>(
  option?: UseUriQueryOption<T>,
): T | undefined => {
  const searchParams = useSearchParams()

  if (searchParams.size === 0) {
    return undefined
  }

  const q = searchParams.get(uri.query.key)

  if (q === null) {
    return undefined
  }

  const raw: QueryParams = uri.query.decode(q)

  if (option?.normalize) {
    return option.normalize(raw)
  }

  return raw as unknown as T
}
