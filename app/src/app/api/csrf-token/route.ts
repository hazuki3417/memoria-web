import { NextRequest, NextResponse } from "next/server";
import csrf from "csrf";
import cookie from "cookie";

const tokens = new csrf();

export async function GET(req: NextRequest) {
	// TODO: env value
	const csrfToken = tokens.create("process.env.CSRF_SECRET");

	const response = NextResponse.json({ csrfToken });
	response.headers.set(
		"Set-Cookie",
		cookie.serialize("csrfToken", csrfToken, {
			httpOnly: true,
			secure: true,
			sameSite: "strict",
			path: "/",
		}),
	);

	return response;
}
