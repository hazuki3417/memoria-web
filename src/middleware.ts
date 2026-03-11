import { NextResponse, type NextRequest } from "next/server"
import { auth } from "./lib/auth"
import { resolveUri } from "./lib/url"

const routes = [
  resolveUri("/dashboard"),
  resolveUri("/images"),
  resolveUri("/settings"),
]

export async function middleware(request: NextRequest) {
  const session = await auth.getSession(request)

  const pathname = request.nextUrl.pathname

  const isProtected = routes.some((route) => pathname.startsWith(route))

  if (isProtected && !session) {
    const loginUrl = new URL("/auth/login", request.url)
    loginUrl.searchParams.set("returnTo", pathname)

    return NextResponse.redirect(loginUrl)
  }
  return await auth.middleware(request)
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico, sitemap.xml, robots.txt (metadata files)
     */
    "/((?!_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)",
  ],
}
