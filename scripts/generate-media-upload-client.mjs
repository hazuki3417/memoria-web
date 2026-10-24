// Generates the HTTP client and MSW mocks from the API repository's schema.
// Usage: npm run openapi:codegen -- <path-to-memoria-api>
import { spawnSync } from "node:child_process"
import { resolve, join } from "node:path"
import { existsSync } from "node:fs"

const apiRoot = process.argv[2]
if (!apiRoot) {
  console.error("Usage: node scripts/generate-media-upload-client.mjs <path-to-memoria-api>")
  process.exit(2)
}
const schema = join(resolve(apiRoot), "schemas/openapi/media-upload.yaml")
if (!existsSync(schema)) {
  console.error(`Missing canonical OpenAPI schema: ${schema}`)
  process.exit(2)
}
const result = spawnSync("npx", ["--no-install", "orval", "--config", "orval.config.ts"], {
  stdio: "inherit",
  env: { ...process.env, MEMORIA_MEDIA_UPLOAD_OPENAPI: schema },
})
if (result.error) {
  console.error(result.error.message)
  process.exit(1)
}
process.exit(result.status ?? 1)
