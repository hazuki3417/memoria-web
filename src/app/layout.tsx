import { GetMeDocument, GetMeQuery } from "@/graphql"
import { auth } from "@/lib/auth"
import { getLang } from "@/lib/cookies/lang/getLang"
import { createGraphQL } from "@/lib/graphql/server"
import { theme } from "@/lib/theme"
import "@/lib/ze"
import { UserContext } from "@/providers"
import { AppShell, AppShellHeader, AppShellMain } from "@mantine/core"
import type { Metadata } from "next"
import { AppGlobal, Head, Header, Providers } from "./_components"

/**
 * NOTE: 下記の順番でimportすること
 *       core, notifications, charts
 */
import "@mantine/core/styles.css"

import "@mantine/notifications/styles.css"

import { preferenceConfig } from "@/config/preference"
import { AppConfig } from "@/types/app-config"
import "@mantine/charts/styles.css"

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

  const config: AppConfig = {
    preference: preferenceConfig,
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
          config={config}
          user={user}
          option={{ graphql: { token: session?.tokenSet.accessToken } }}
        >
          <AppGlobal />
          <AppShell header={{ height: theme.other.app.header.height }}>
            <AppShellHeader>
              <Header />
            </AppShellHeader>
            <AppShellMain>{children}</AppShellMain>
          </AppShell>
        </Providers>
      </body>
    </html>
  )
}

export default RootLayout
export { metadata }
