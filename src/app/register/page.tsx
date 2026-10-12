import { redirect } from "next/navigation"
import { auth0 } from "@/lib/auth0"
import { UserRegistration } from "@/features/user-registration/UserRegistration"

export default async function Page() {
  const session = await auth0.getSession()
  if (!session) redirect("/login")
  return <UserRegistration />
}
