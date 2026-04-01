/**
 * NOTE: 下記の順番でimportすること
 *       core, notifications, charts
 */
import "@mantine/core/styles.css"

import "@mantine/notifications/styles.css"

import { preferenceConfig } from "@/config/preference"
import { AppConfig } from "@/types/app-config"
import "@mantine/charts/styles.css"
import { ColorSchemeScript, mantineHtmlProps } from "@mantine/core"

import { getLocale } from "@/lib/locale"
import { theme } from "@/lib/theme"
import "@/lib/ze"
import type { Metadata } from "next"
import { Providers } from "./_components"

const metadata: Metadata = {
  title: "Memoria",
  description: "Memoria",
}

type RootLayoutProps = {
  children: React.ReactNode
}

const RootLayout = async (props: RootLayoutProps) => {
  const { children } = props
  const locale = await getLocale()

  const config: AppConfig = {
    preference: preferenceConfig,
  }

  return (
    <html lang={locale.value} {...mantineHtmlProps}>
      <head>
        <ColorSchemeScript defaultColorScheme="auto" />
        <meta
          name="viewport"
          content="minimum-scale=1, initial-scale=1, width=device-width, user-scalable=no"
        />
      </head>
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
