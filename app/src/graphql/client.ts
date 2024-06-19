import {
	ApolloClient as OriginClient,
	HttpLink,
	InMemoryCache,
	NormalizedCacheObject,
} from "@apollo/client";

let apollo: OriginClient<NormalizedCacheObject> | null = null;

const ApolloClient = () => {
	// TODO: env value
	const httpLink = new HttpLink({
		// uri: "http://localhost:8080/graphql", // 直バックエンド
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

	console.log("init", init);
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

export default NewApolloClient;
