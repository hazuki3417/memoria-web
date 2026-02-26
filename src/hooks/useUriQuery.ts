import { uri } from "@/lib/url";
import { QueryParams } from "@/types/url";
import "client-only";
import { useSearchParams } from "next/navigation";

type UseUriQueryOptions<T> = {
  normalize?: (raw: QueryParams) => T;
};

export const useUriQuery = <T extends QueryParams>(
  options?: UseUriQueryOptions<T>,
): T | undefined => {
  const searchParams = useSearchParams();

  if (searchParams.size === 0) {
    return undefined;
  }

  const q = searchParams.get(uri.query.key);

  if (q === null) {
    return undefined;
  }

  const raw: QueryParams = uri.query.decode(q);

  if (options?.normalize) {
    return options.normalize(raw);
  }

  return raw as unknown as T;
};
