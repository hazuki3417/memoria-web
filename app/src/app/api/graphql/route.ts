import { NextRequest } from "next/server";

export async function POST(request: NextRequest) {
  const body = await request.text();

  /**
   * TODO: CSRF
   * TODO: Auth
   * TODO: OpenTelemetry
   * TODO: Env
   */

  const auth = request.headers.get("authorization");

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  // AuthorizationがあればGraphQL APIに転送
  if (auth) {
    headers["Authorization"] = auth;
  }

  const response = await fetch("http://localhost:8080/graphql", {
    method: "POST",
    headers,
    body,
  });

  return new Response(await response.text(), {
    status: response.status,
    headers: { "Content-Type": "application/json" },
  });
}
