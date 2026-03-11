import { Header } from "@/feature"
import { LangSelect } from "@/feature/Header/LangSelect"
import { UserMenu } from "@/feature/Header/UserMenu"
import { GetMeDocument, GetMeQuery } from "@/graphql"
import { auth } from "@/lib/auth"
import { createGraphQL } from "@/lib/graphql/server"
import { theme } from "@/lib/theme"
import { UserContext } from "@/providers"
import { AppShell, AppShellHeader, AppShellMain } from "@mantine/core"
import { Providers } from "./_components"

type LayoutProps = {
  children: React.ReactNode
}

const Layout = async (props: LayoutProps) => {
  const { children } = props
  const session = await auth.getSession()

  let user: UserContext = null

  if (session !== null) {
    const client = createGraphQL({ token: session.tokenSet.accessToken })

    try {
      const result = await client.query<GetMeQuery>({ query: GetMeDocument })
      user = {
        ...result.data.me,
      }
    } catch (error) {
      console.error(error)
    }
  }

  return (
    <Providers user={user} graphql={{ token: session?.tokenSet.accessToken }}>
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
