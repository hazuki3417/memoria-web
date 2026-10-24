import { resolve } from "node:path"
import { defineConfig } from "orval"

// API repository's OpenAPI schema is the sole contract source.
// Set MEMORIA_MEDIA_UPLOAD_OPENAPI to its absolute path when generating.
const schema = resolve(process.env.MEMORIA_MEDIA_UPLOAD_OPENAPI ?? "../memoria-api/schemas/openapi/media-upload.yaml")

export default defineConfig({
  mediaUpload: {
    input: { target: schema },
    output: {
      mode: "single",
      target: "./src/infrastructure/openapi/generated/mediaUpload.ts",
      client: "fetch",
      mock: true,
    },
  },
})
