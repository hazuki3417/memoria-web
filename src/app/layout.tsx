import { GetMeDocument, GetMeQuery } from "@/graphql"
import { auth } from "@/lib/auth"
import { getLang } from "@/lib/cookies/lang/getLang"
import { createGraphQL } from "@/lib/graphql/server"
import { theme } from "@/lib/theme"
import "@/lib/zod"
import { AuthContext } from "@/providers"
import {
  AppShell,
  AppShellHeader,
  AppShellMain,
  Container,
} from "@mantine/core"
import "@mantine/core/styles.css"
import { Notifications } from "@mantine/notifications"
import "@mantine/notifications/styles.css"
import type { Metadata } from "next"
import { AppShellModal, Header } from "./_components"
import Head from "./Head"
import Providers from "./Providers"

const metadata: Metadata = {
  title: "Memoria",
  description: "Memoria",
}

type RootLayoutProps = {
  children: React.ReactNode
}

const RootLayout = async (props: RootLayoutProps) => {
  const { children } = props
  const lang = await getLang()
  const session = await auth.getSession()

  const context: AuthContext = {
    isSignIn: false,
    user: undefined,
  }

  if (session !== null) {
    context.isSignIn = true
    const client = createGraphQL({ token: session.tokenSet.accessToken })

    try {
      const result = await client.query<GetMeQuery>({ query: GetMeDocument })
      context.user = {
        id: result.data.me.id,
      }
    } catch (error) {
      console.debug("error", error)
    }
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
          <Notifications position="top-right" limit={3} autoClose={3000} />
          <AppShell header={{ height: theme.other.app.header.height }}>
            <AppShellHeader>
              <Header />
            </AppShellHeader>
            <AppShellMain>
              <Container p={"lg"} m={0} fluid>
                {children}
              </Container>
            </AppShellMain>
            <AppShellModal />
          </AppShell>
        </Providers>
      </body>
    </html>
  )
}

export default RootLayout
export { metadata }
