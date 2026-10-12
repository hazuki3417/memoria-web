import Link from "next/link"
import { redirect } from "next/navigation"
import { auth0 } from "@/lib/auth0"

export default async function LoginPage() {
  const session = await auth0.getSession()
  if (session) redirect("/dashboard")

  return (
    <main style={{ maxWidth: 440, margin: "15vh auto", padding: 24 }}>
      <h1>Memoria</h1>
      <p>Memoriaを利用するにはログインしてください。</p>
      <Link href="/auth/login?returnTo=%2Fdashboard">Auth0でログイン</Link>
    </main>
  )
}
