import { NextResponse, type NextRequest } from "next/server"
import { auth0 } from "@/lib/auth0"

// Uploads use their own same-origin BFF transport. Never expose API tokens to the browser.
export async function POST(request: NextRequest) {
  if (!(await auth0.getSession())) {
    return NextResponse.json({ error: { code: "UNAUTHENTICATED", message: "unauthenticated" } }, { status: 401 })
  }

  if (!request.headers.get("content-type")?.toLowerCase().startsWith("multipart/form-data;")) {
    return NextResponse.json({ error: { code: "VALIDATION", message: "multipart/form-data required" } }, { status: 415 })
  }

  const key = request.headers.get("idempotency-key")
  if (!key || key.length > 255 || /[^\x21-\x7e]/.test(key)) {
    return NextResponse.json({ error: { code: "VALIDATION", message: "invalid Idempotency-Key" } }, { status: 400 })
  }

  const graphqlURL = process.env.MEMORIA_GRAPHQL_URL
  if (!graphqlURL) {
    return NextResponse.json({ error: { code: "UNAVAILABLE", message: "service unavailable" } }, { status: 503 })
  }

  let token: string
  try {
    token = (await auth0.getAccessToken()).token
  } catch {
    return NextResponse.json({ error: { code: "UNAUTHENTICATED", message: "unauthenticated" } }, { status: 401 })
  }

  try {
    const target = new URL("/api/media/uploads", graphqlURL)
    const response = await fetch(target, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Idempotency-Key": key,
        "Content-Type": request.headers.get("content-type")!,
      },
      body: request.body,
      // Streaming request bodies require duplex in Node.js fetch.
      duplex: "half",
      cache: "no-store",
    } as RequestInit & { duplex: "half" })
    return new Response(response.body, {
      status: response.status,
      headers: {
        "Content-Type": response.headers.get("content-type") ?? "application/json",
        "Cache-Control": "no-store",
      },
    })
  } catch {
    return NextResponse.json({ error: { code: "UNAVAILABLE", message: "backend unavailable" } }, { status: 502 })
  }
}
