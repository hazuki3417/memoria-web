// @vitest-environment node
import { jwtVerify, SignJWT } from "jose"
import { describe, expect, it } from "vitest"
import { createApiToken, createTestSession, readTestSession } from "./token"

const now = 1_800_000_000
const actor = { subject: "test-actor-a", runId: "run-a" }
const sessionKey = new Uint8Array(32).fill(1)
const apiKey = new Uint8Array(32).fill(2)
const keys = { sessionKey, apiKey }
const issuer = "https://memoria-e2e.invalid/"

describe("E2E認証Token", () => {
  it("Sessionから同じ認証主体のAPI Tokenを発行する", async () => {
    const session = await createTestSession(actor, sessionKey, now)
    expect(await readTestSession(session, sessionKey, actor.runId, now)).toEqual({
      issuer,
      subject: actor.subject,
      runId: actor.runId,
      expiresAt: now + 900,
    })

    const apiToken = await createApiToken(session, keys, actor.runId, now)
    const { payload } = await jwtVerify(apiToken, apiKey, {
      algorithms: ["HS256"],
      issuer,
      audience: "memoria-e2e-api",
      currentDate: new Date(now * 1000),
    })
    expect(payload).toEqual({
      iss: issuer,
      sub: actor.subject,
      aud: "memoria-e2e-api",
      purpose: "api",
      run_id: actor.runId,
      iat: now,
      exp: now + 60,
    })
    await expect(readTestSession(apiToken, sessionKey, actor.runId, now)).rejects.toThrow(
      "Invalid E2E session",
    )
  })

  it("API Tokenの期限はSessionの残り時間を超えない", async () => {
    const session = await createTestSession(actor, sessionKey, now)
    const token = await createApiToken(session, keys, actor.runId, now + 890)
    const { payload } = await jwtVerify(token, apiKey, {
      currentDate: new Date((now + 890) * 1000),
    })
    expect(payload.exp).toBe(now + 900)
  })

  it("期限切れや別RunのSessionから発行しない", async () => {
    const session = await createTestSession(actor, sessionKey, now)
    await expect(createApiToken(session, keys, actor.runId, now + 900)).rejects.toThrow(
      "Invalid E2E session",
    )
    await expect(createApiToken(session, keys, "run-b", now)).rejects.toThrow(
      "Invalid E2E session",
    )
  })

  it("異なる鍵で署名されたSessionを拒否する", async () => {
    const session = await createTestSession(actor, apiKey, now)
    await expect(readTestSession(session, sessionKey, actor.runId, now)).rejects.toThrow(
      "Invalid E2E session",
    )
  })

  it("同じ署名鍵または短い鍵の利用を拒否する", async () => {
    const session = await createTestSession(actor, sessionKey, now)
    await expect(
      createApiToken(session, { sessionKey, apiKey: sessionKey.slice() }, actor.runId, now),
    ).rejects.toThrow("E2E session and API signing keys must be different")
    await expect(createTestSession(actor, new Uint8Array(31), now)).rejects.toThrow(
      "E2E signing key must contain at least 32 bytes",
    )
  })

  it.each([
    { purpose: "api", iat: now, exp: now + 900 },
    { purpose: "session", iat: now + 1, exp: now + 900 },
    { purpose: "session", iat: now, exp: now + 901 },
  ])("不正な用途または有効期間を拒否する: %o", async (claims) => {
    const token = await new SignJWT({ ...claims, run_id: actor.runId })
      .setProtectedHeader({ alg: "HS256" })
      .setIssuer(issuer)
      .setSubject(actor.subject)
      .setAudience("memoria-e2e-web")
      .sign(sessionKey)
    await expect(readTestSession(token, sessionKey, actor.runId, now)).rejects.toThrow(
      "Invalid E2E session",
    )
  })
})
