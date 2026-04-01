import { NextResponse, type NextRequest } from "next/server"
import { auth } from "./lib/auth"
import { getLocale, setLocale } from "./lib/middleware"
import { isProtectedRoute, redirectLogin } from "./lib/middleware/route"

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname
  const session = await auth.getSession(request)

  const isProtected = isProtectedRoute(pathname)
  const locale = getLocale(request)

  if (!session && isProtected) {
    const loginUrl = redirectLogin(pathname, request.url)
    const response = NextResponse.redirect(loginUrl)
    setLocale(response, locale.value)
    return response
  }

  const response = await auth.middleware(request)

  if (locale.type !== "cookie") {
    setLocale(response, locale.value)
  }

  return response
}
