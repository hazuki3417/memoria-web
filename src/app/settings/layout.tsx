import { ApplicationShellContainer } from "@/features/application-shell/ApplicationShellContainer"

export default function SettingsLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return <ApplicationShellContainer>{children}</ApplicationShellContainer>
}
