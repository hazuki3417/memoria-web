import { redirect } from "next/navigation"
import { ConnectedAccountRegistration } from "@/features/account-registration"
import { getCurrentMemoriaUser } from "@/infrastructure/graphql"
import { auth0 } from "@/lib/auth0"

export default async function Page() {
  const session = await auth0.getSession()
  if (!session) redirect("/login")
  const currentUser = await getCurrentMemoriaUser()
  if (currentUser.kind === "active") redirect("/dashboard")
  if (currentUser.kind === "unavailable") redirect("/auth/unavailable")
  if (currentUser.kind === "error") redirect("/auth/error")
  return <ConnectedAccountRegistration />
}
