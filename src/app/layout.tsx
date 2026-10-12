import "@mantine/core/styles.css"
import "@mantine/notifications/styles.css"
import type { Metadata } from "next"
import { ColorSchemeScript } from "@mantine/core"
import { Notifications } from "@mantine/notifications"
import { theme } from "@/lib/theme"
import { ThemeProvider } from "@/providers/ThemeProvider"
import "./globals.css"

export const metadata: Metadata = {
  title: "Memoria",
  description: "Memoria web application",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="ja" suppressHydrationWarning>
      <head>
        <ColorSchemeScript defaultColorScheme="auto" />
      </head>
      <body>
        <ThemeProvider theme={theme}>
          <Notifications />
          {children}
        </ThemeProvider>
      </body>
    </html>
  )
}
