import { Header } from "@/feature"
import { LangSelect } from "@/feature/Header/LangSelect"
import { UserMenu } from "@/feature/Header/UserMenu"
import { GetMeDocument, GetMeQuery } from "@/graphql"
import { auth } from "@/lib/auth"
import { createGraphQL } from "@/lib/graphql/server"
import { theme } from "@/lib/theme"
import { UserContext } from "@/providers"
import { AppShell, AppShellHeader, AppShellMain } from "@mantine/core"
import { AppGlobal } from "../_components"
import { Providers } from "./_components"

type LayoutProps = {
  children: React.ReactNode
}

const Layout = async (props: LayoutProps) => {
  const { children } = props
  const session = await auth.getSession()

  if (session === null) {
    return null
  }

  const graphql = { token: session.tokenSet.accessToken }
  const client = createGraphQL(graphql)
  const result = await client.query<GetMeQuery>({ query: GetMeDocument })

  const user: UserContext = {
    ...result.data.me,
  }

  return (
    <Providers user={user} graphql={graphql}>
      <AppGlobal />
      <AppShell header={{ height: theme.other.app.header.height }}>
        <AppShellHeader>
          <Header>
            <LangSelect />
            <UserMenu />
          </Header>
        </AppShellHeader>
        <AppShellMain>{children}</AppShellMain>
      </AppShell>
    </Providers>
  )
}

export default Layout
