import type { NextRequest } from "next/server"
import { auth0 } from "@/lib/auth0"

// Auth0 v4 mounts /auth/login, /auth/callback and /auth/logout here.
export async function proxy(request: NextRequest) {
  return auth0.middleware(request)
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
}
