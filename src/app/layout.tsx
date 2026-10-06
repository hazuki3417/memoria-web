import "@mantine/core/styles.css"
import type { Metadata } from "next"
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
    <html lang="ja">
      <body>
        <ThemeProvider theme={theme}>{children}</ThemeProvider>
      </body>
    </html>
  )
}
