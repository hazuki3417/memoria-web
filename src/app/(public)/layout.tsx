import { Header } from "@/feature"
import { LangSelect } from "@/feature/Header/LangSelect"
import { SignInButton } from "@/feature/Header/SignInButton"
import { theme } from "@/lib/theme"
import { AppShell, AppShellHeader, AppShellMain } from "@mantine/core"
import { Providers } from "./_components"

type LayoutProps = {
  children: React.ReactNode
}

const Layout = async (props: LayoutProps) => {
  const { children } = props

  return (
    <Providers>
      <AppShell header={{ height: theme.other.app.header.height }}>
        <AppShellHeader>
          <Header>
            <LangSelect />
            <SignInButton size="xs" />
          </Header>
        </AppShellHeader>
        <AppShellMain style={{ height: "100vh" }}>{children}</AppShellMain>
      </AppShell>
    </Providers>
  )
}

export default Layout
