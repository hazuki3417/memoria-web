"use client";
import { useQuery, QueryHookOptions, QueryResult } from "@apollo/client";
import { Input, Content } from "./type";
import { GQL } from "./gql";

type Result = QueryResult<Content, Input>;

/**
 * 更に汎用的に利用できるよう以下の型とプロパティを外部から指定できるようにする
 * - property: GQL
 * - type: Input, Content
 */

const useData = (options: QueryHookOptions<Content, Input>) => {
	return useQuery<Content, Input>(GQL, options);
};

export default useData;
export { type Result };
