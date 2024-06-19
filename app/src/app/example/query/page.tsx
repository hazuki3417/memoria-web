import { ApolloProvider } from "@/component/containers";
import Client from "./Client";
import Server from "./Server";

export default function Page() {
	return (
		<>
			<div>example query</div>
			<Server />
			<ApolloProvider>
				<Client />
			</ApolloProvider>
		</>
	);
}
