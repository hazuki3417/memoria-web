import { QueryOptions } from "@apollo/client";
import { Input, Content } from "./type";
import { GQL } from "./gql";
import NewApolloClient from "@/graphql/client";

const client = NewApolloClient();

/**
 * 更に汎用的に利用できるよう以下の型とプロパティを外部から指定できるようにする
 * - property: {query: GQL}
 * - type: Input, Content
 */

type Options = Omit<QueryOptions<Input>, "query">;
const fetchData = async (options: Options) => {
	return await client.query<Content, Input>({ query: GQL, ...options });
};

export default fetchData;
