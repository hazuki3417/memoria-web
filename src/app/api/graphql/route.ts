import { serverEnv } from "@/env/server";
import { NextRequest } from "next/server";

export const runtime = "nodejs";

type NodeFetchInit = RequestInit & {
  duplex?: "half";
};

export async function POST(request: NextRequest) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 30_000); // 30秒タイムアウト

  try {
    const headers = new Headers(request.headers);

    // Host は upstream 用に削除（安全対策）
    headers.delete("host");

    const upstream = await fetch(serverEnv.API_URI, {
      method: "POST",
      headers,
      body: request.body,
      duplex: "half",
      signal: controller.signal,
    } as NodeFetchInit);

    clearTimeout(timeout);

    // レスポンスを完全透過
    return new Response(upstream.body, {
      status: upstream.status,
      headers: upstream.headers,
    });
  } catch (error) {
    clearTimeout(timeout);

    console.error("GraphQL proxy error:", error);

    return new Response(
      JSON.stringify({
        error: "Upstream GraphQL proxy failed",
      }),
      {
        status: 502,
        headers: { "content-type": "application/json" },
      },
    );
  }
}
