import "@mantine/core/styles.css";
import "@/lib/zod";
import type { Metadata } from "next";
import Head from "./Head";
import Providers from "./Providers";
import { Header } from "@/components";
import {
  AppShell,
  AppShellHeader,
  AppShellMain,
  Container,
} from "@mantine/core";
import { getLang } from "@/lib/cookies/lang/getLang";
import { auth } from "@/lib/auth";
import { createGraphQL } from "@/lib/graphql/server";
import { GetMeDocument, GetMeQuery } from "@/graphql";
import { AuthContext } from "@/providers";
import { theme } from "@/lib/theme";
import { format } from "date-fns";

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
    user: undefined,
  };

  if (session !== null) {
    context.isSignIn = true;
    const client = createGraphQL({ token: session.tokenSet.accessToken });
    const result = await client.query<GetMeQuery>({ query: GetMeDocument });
    context.user = {
      id: result.data.me.id,
    };

    // console.debug("debug", {
    //   response: result.data.me,
    //   createdAt: result.data.me.createdAt,
    //   createdAtDate: new Date(result.data.me.createdAt),
    //   createdAtDisp: format(new Date(result.data.me.createdAt), "yyyy-MM-dd HH:mm:ss"),
    //   createdAtDisp2: format(new Date(result.data.me.createdAt), "yyyy-MM-dd HH:mm:ssXXX"),
    // })
  }

  return (
    <html data-mantine-color-scheme="dark" lang={lang}>
      {/* FIX: data-mantine-color-scheme="dark"の記述がない場合、ハイドレーションの差分が発生してエラーになる */}
      <Head />
      <body>
        <Providers
          theme={{
            theme,
            defaultColorScheme: "auto",
          }}
          auth={context}
          option={{ graphql: { token: session?.tokenSet.accessToken } }}
        >
          <AppShell header={{ height: theme.other.app.header.height }}>
            <AppShellHeader>
              <Header />
            </AppShellHeader>
            <AppShellMain>
              <Container p={"lg"} m={0} fluid>
                {children}
              </Container>
            </AppShellMain>
          </AppShell>
        </Providers>
      </body>
    </html>
  );
};

export default RootLayout;
export { metadata };
