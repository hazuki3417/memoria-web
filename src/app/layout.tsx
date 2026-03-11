import { getLang } from "@/lib/cookies/lang/getLang"
import { theme } from "@/lib/theme"
import "@/lib/ze"
import type { Metadata } from "next"
import { Head, Providers } from "./_components"

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
        >
          {children}
        </Providers>
      </body>
    </html>
  )
}

export default RootLayout
export { metadata }
