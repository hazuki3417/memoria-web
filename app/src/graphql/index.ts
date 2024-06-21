import {
	ApolloClient as OriginClient,
	HttpLink,
	InMemoryCache,
	NormalizedCacheObject,
	QueryOptions,
	OperationVariables,
	MutationOptions,
	DocumentNode,
	DefaultContext,
} from "@apollo/client";

let apollo: OriginClient<NormalizedCacheObject> | null = null;

const ApolloClient = () => {
	// TODO: env value
	const httpLink = new HttpLink({
		uri: "http://localhost:3000/api/record", // app router経由
	});

	const client = new OriginClient({
		ssrMode: typeof window === "undefined",
		link: httpLink,
		cache: new InMemoryCache(),
	});
	return client;
};

const NewApolloClient = (init: NormalizedCacheObject | null = null) => {
	// singleton
	const client = apollo ?? ApolloClient();

	if (init) {
		client.cache.restore({ ...client.extract(), ...init });
	}

	if (!apollo) {
		apollo = client;
	}

	if (typeof window === "undefined") {
		return client;
	}

	return client;
};
export interface Input {
	id: string;
}

const client = NewApolloClient();

const query = <
	T = any,
	TVariables extends OperationVariables = OperationVariables,
>(
	gql: DocumentNode,
	options?: Omit<QueryOptions<TVariables>, "query">,
) => {
	return client.query<T, TVariables>({ query: gql, ...options });
};

const mutation = <
	T = any,
	TVariables extends OperationVariables = OperationVariables,
>(
	gql: DocumentNode,
	options: Omit<MutationOptions<T, TVariables>, "mutation">,
) => {
	return client.mutate<T, TVariables>({ mutation: gql, ...options });
};

export interface ApolloClientResult<T> {
	loading: boolean;
	data?: T;
	error?: Error;
}

export default NewApolloClient;
export { query, mutation };
