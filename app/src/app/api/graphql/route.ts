import { serverEnv } from "@/env/server";
import { NextRequest } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.blob();
    const headers = new Headers(request.headers);
    const response = await fetch(serverEnv.API_URI, {
      method: "POST",
      headers,
      body,
    });

    return new Response(await response.text(), {
      status: response.status,
      headers: {
        "Content-Type":
          response.headers.get("Content-Type") || "application/json",
      },
    });
  } catch (err) {
    console.error(err);
  }
}
