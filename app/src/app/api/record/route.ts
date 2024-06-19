import { NextResponse } from "next/server";

/**
 * proxy POST request to GraphQL API（memoria-record）
 */
export async function POST(request: Request) {
	const body = await request.json();

	/**
	 * TODO: csrfトークンの検証
	 * TODO: 認可処理を追加
	 * TODO: OpenTelemetryのトレースをIDを渡す
	 * TODO: env value
	 */

	const response = await fetch("http://localhost:8080/graphql", {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
		},
		body: JSON.stringify(body),
	});

	const data = await response.json();
	return NextResponse.json(data);
}
