import { jwtVerify, SignJWT } from "jose"

const ISSUER = "https://memoria-e2e.invalid/"
const SESSION_AUDIENCE = "memoria-e2e-web"
const API_AUDIENCE = "memoria-e2e-api"
const SESSION_TTL_SECONDS = 15 * 60
const API_TTL_SECONDS = 60

type TestActor = {
  subject: string
  runId: string
}

type TestSession = TestActor & {
  issuer: string
  expiresAt: number
}

type SigningKeys = {
  sessionKey: Uint8Array
  apiKey: Uint8Array
}

const assertKey = (key: Uint8Array) => {
  if (key.byteLength < 32) {
    throw new Error("E2E signing key must contain at least 32 bytes")
  }
}

const assertKeys = ({ sessionKey, apiKey }: SigningKeys) => {
  assertKey(sessionKey)
  assertKey(apiKey)
  if (Buffer.from(sessionKey).equals(Buffer.from(apiKey))) {
    throw new Error("E2E session and API signing keys must be different")
  }
}

const isNonBlank = (input: unknown): input is string =>
  typeof input === "string" && input.trim().length > 0

const assertActor = ({ subject, runId }: TestActor) => {
  if (!isNonBlank(subject) || !isNonBlank(runId)) {
    throw new Error("E2E actor and run identifiers are required")
  }
}

const unixNow = () => Math.floor(Date.now() / 1000)

const sign = async (
  actor: TestActor,
  key: Uint8Array,
  purpose: "session" | "api",
  audience: string,
  now: number,
  expiresAt: number,
): Promise<string> => {
  assertKey(key)
  assertActor(actor)
  if (
    !Number.isSafeInteger(now) ||
    !Number.isSafeInteger(expiresAt) ||
    now <= 0 ||
    expiresAt <= now
  ) {
    throw new Error("Invalid E2E token lifetime")
  }
  return new SignJWT({ purpose, run_id: actor.runId })
    .setProtectedHeader({ alg: "HS256", typ: "JWT" })
    .setIssuer(ISSUER)
    .setSubject(actor.subject)
    .setAudience(audience)
    .setIssuedAt(now)
    .setExpirationTime(expiresAt)
    .sign(key)
}

// E2E専用。製品の認証処理やClient Componentから参照しない。
export const createTestSession = (
  actor: TestActor,
  sessionKey: Uint8Array,
  now = unixNow(),
): Promise<string> =>
  sign(actor, sessionKey, "session", SESSION_AUDIENCE, now, now + SESSION_TTL_SECONDS)

export const readTestSession = async (
  token: string,
  sessionKey: Uint8Array,
  runId: string,
  now = unixNow(),
): Promise<TestSession> => {
  assertKey(sessionKey)
  if (!isNonBlank(runId) || !Number.isSafeInteger(now) || now <= 0) {
    throw new Error("Invalid E2E session verification context")
  }

  try {
    const { payload } = await jwtVerify(token, sessionKey, {
      algorithms: ["HS256"],
      issuer: ISSUER,
      audience: SESSION_AUDIENCE,
      requiredClaims: ["iss", "sub", "aud", "iat", "exp", "purpose", "run_id"],
      currentDate: new Date(now * 1000),
    })

    const { sub, aud, iat, exp, purpose, run_id } = payload
    if (
      !isNonBlank(sub) ||
      aud !== SESSION_AUDIENCE ||
      typeof iat !== "number" ||
      !Number.isSafeInteger(iat) ||
      iat <= 0 ||
      iat > now ||
      typeof exp !== "number" ||
      !Number.isSafeInteger(exp) ||
      exp <= now ||
      exp <= iat ||
      exp - iat > SESSION_TTL_SECONDS ||
      purpose !== "session" ||
      run_id !== runId
    ) {
      throw new Error("Invalid E2E session claims")
    }
    return { issuer: ISSUER, subject: sub, runId, expiresAt: exp }
  } catch {
    // 認証情報や検証ライブラリのエラー詳細を外側へ公開しない。
    throw new Error("Invalid E2E session")
  }
}

export const createApiToken = async (
  sessionToken: string,
  keys: SigningKeys,
  runId: string,
  now = unixNow(),
): Promise<string> => {
  assertKeys(keys)
  const session = await readTestSession(sessionToken, keys.sessionKey, runId, now)

  return sign(
    session,
    keys.apiKey,
    "api",
    API_AUDIENCE,
    now,
    Math.min(now + API_TTL_SECONDS, session.expiresAt),
  )
}
