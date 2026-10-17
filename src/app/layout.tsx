import "@mantine/core/styles.css"
import "@mantine/notifications/styles.css"
import { ColorSchemeScript } from "@mantine/core"
import { Notifications } from "@mantine/notifications"
import type { Metadata } from "next"
import { theme } from "@/lib/theme"
import { ThemeProvider } from "@/providers/ThemeProvider"
import { ApolloProvider } from "@/providers/ApolloProvider"
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
          <Notifications
            position="top-right"
            styles={{
              root: {
                top: "var(--memoria-notification-top, var(--mantine-spacing-md))",
                pointerEvents: "none",
              },
              notification: { pointerEvents: "auto" },
            }}
          />
          <ApolloProvider>{children}</ApolloProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
