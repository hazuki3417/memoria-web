import { NextResponse, type NextRequest } from "next/server"
import { auth0 } from "@/lib/auth0"

// Same-origin GraphQL transport: Auth0 access tokens stay on the server.
export async function POST(request: NextRequest) {
  if (!(await auth0.getSession())) {
    return NextResponse.json(
      { errors: [{ message: "unauthenticated" }] },
      { status: 401 },
    )
  }
  const endpoint = process.env.MEMORIA_GRAPHQL_URL
  if (!endpoint) {
    return NextResponse.json(
      { errors: [{ message: "service unavailable" }] },
      { status: 503 },
    )
  }
  let token: string
  try {
    token = (await auth0.getAccessToken()).token
  } catch {
    return NextResponse.json(
      { errors: [{ message: "unauthenticated" }] },
      { status: 401 },
    )
  }
  // Only JSON GraphQL POST requests are forwarded. Uploads need a separate
  // supported transport contract before the Media feature is migrated.
  if (!request.headers.get("content-type")?.startsWith("application/json")) {
    return NextResponse.json(
      { errors: [{ message: "unsupported content type" }] },
      { status: 415 },
    )
  }
  try {
    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: await request.text(),
      cache: "no-store",
    })
    return new Response(response.body, {
      status: response.status,
      headers: {
        "Content-Type":
          response.headers.get("content-type") ?? "application/json",
        "Cache-Control": "no-store",
      },
    })
  } catch {
    return NextResponse.json(
      { errors: [{ message: "backend unavailable" }] },
      { status: 502 },
    )
  }
}
