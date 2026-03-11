import { auth } from "@/lib/auth"
import { resolveUri } from "@/lib/url"
import { redirect } from "next/navigation"

export const AuthGuard = async () => {
  const session = await auth.getSession()

  if (!session) {
    redirect(resolveUri("/auth/login"))
  }
  return null
}
