import { COOKIE } from "@/constants/cookie"
import { cookies } from "next/headers"

export async function POST(req: Request) {
  const { locale } = await req.json()
  const cookie = await cookies()
  cookie.set(COOKIE.LOCALE.name, locale, {
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
  })

  return new Response(null, { status: 204 })
}
