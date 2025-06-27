import "@mantine/core/styles.css";
import "@mantine/dropzone/styles.css";
import "@/lib/zod";
import type { Metadata } from "next";
import Head from "./Head";
import Providers from "./Providers";
import { Header } from "@/components";
import { Container } from "@mantine/core";
import { getLang } from "@/lib/cookies/lang/getLang";
import { auth } from "@/lib/auth";
import { createGraphQL } from "@/lib/graphql/server";
import { GetMeDocument, GetMeQuery } from "@/graphql";
import { AuthContext } from "@/providers";

const metadata: Metadata = {
  title: "Memoria",
  description: "Memoria",
};

type RootLayoutProps = {
  children: React.ReactNode;
};

const RootLayout = async (props: RootLayoutProps) => {
  const { children } = props;
  const lang = await getLang();
  const session = await auth.getSession();

  const context: AuthContext = {
    isSignIn: false,
    auth: { user: undefined },
    app: { user: undefined },
  };

  if (session !== null) {
    context.isSignIn = true;
    const client = createGraphQL({ token: session.tokenSet.accessToken });
    const result = await client.query<GetMeQuery>({ query: GetMeDocument });
    context.auth.user = session.user;
    context.app.user = result.data.me;
  }

  return (
    <html data-mantine-color-scheme="dark" lang={lang}>
      {/* FIX: data-mantine-color-scheme="dark"の記述がない場合、ハイドレーションの差分が発生してエラーになる */}
      <Head />
      <body>
        <Providers
          auth={context}
          option={{ graphql: { token: session?.tokenSet.accessToken } }}
        >
          <Header />
          <main>
            <Container p={"lg"} m={0} fluid>
              {children}
            </Container>
          </main>
        </Providers>
      </body>
    </html>
  );
};

export default RootLayout;
export { metadata };
