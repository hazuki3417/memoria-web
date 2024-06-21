import { NextRequest, NextResponse } from "next/server";
import csrf from "csrf";
import Cookies from "universal-cookie";

const tokens = new csrf();
const cookies = new Cookies();

export async function GET(req: NextRequest) {
	// TODO: env value
	const cookieName = "csrfToken";
	const cookieValue = tokens.create("process.env.CSRF_SECRET");

	cookies.set(cookieName, cookieValue, {
		httpOnly: true,
		secure: true,
		sameSite: "strict",
		path: "/",
	});

	const response = NextResponse.json({ cookieValue });
	response.headers.set(
		"Set-Cookie",
		`${cookieName}=` + cookies.get(cookieName),
	);

	return response;
}
