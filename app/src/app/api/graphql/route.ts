import { NextRequest } from "next/server";

export async function POST(request: NextRequest) {
  const body = await request.text();

  /**
   * TODO: CSRF
   * TODO: Auth
   * TODO: OpenTelemetry
   * TODO: Env
   */

  const response = await fetch("http://localhost:8080/graphql", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body,
  });

  return new Response(await response.text(), {
    status: response.status,
    headers: { "Content-Type": "application/json" },
  });
}
