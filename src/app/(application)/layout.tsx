import { redirect } from "next/navigation"
import { auth0 } from "@/lib/auth0"
import { ApplicationShellContainer } from "@/features/application-shell/ApplicationShellContainer"

export default async function ApplicationLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const session = await auth0.getSession()
  if (!session) redirect("/login")
  return <ApplicationShellContainer>{children}</ApplicationShellContainer>
}
