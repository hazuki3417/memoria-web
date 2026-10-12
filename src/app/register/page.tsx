import { redirect } from "next/navigation"
import { auth0 } from "@/lib/auth0"
import { getCurrentMemoriaUser } from "@/lib/memoria-api"
import { UserRegistration } from "@/features/user-registration/UserRegistration"

export default async function Page() {
  const session = await auth0.getSession()
  if (!session) redirect("/login")
  const currentUser = await getCurrentMemoriaUser()
  if (currentUser.kind === "active") redirect("/dashboard")
  if (currentUser.kind === "unavailable") redirect("/auth/unavailable")
  if (currentUser.kind === "error") redirect("/auth/error")
  return <UserRegistration />
}
