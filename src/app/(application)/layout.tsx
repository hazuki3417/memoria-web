import { redirect } from "next/navigation"
import { ApplicationShellContainer } from "@/features/application-shell/ApplicationShellContainer/ApplicationShellContainer"
import { getCurrentMemoriaUser } from "@/infrastructure/graphql"
import { auth0 } from "@/lib/auth0"

export default async function ApplicationLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const session = await auth0.getSession()
  if (!session) redirect("/login")
  const currentUser = await getCurrentMemoriaUser()
  if (currentUser.kind === "unregistered") redirect("/register")
  if (currentUser.kind === "unavailable") redirect("/auth/unavailable")
  if (currentUser.kind === "error") redirect("/auth/error")
  return <ApplicationShellContainer>{children}</ApplicationShellContainer>
}
