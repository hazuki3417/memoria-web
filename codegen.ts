import type { CodegenConfig } from "@graphql-codegen/cli"

const config: CodegenConfig = {
  schema: process.env.GRAPHQL_SCHEMA_URL || "src/infrastructure/graphql/schema.graphql",
  documents: ["src/infrastructure/graphql/operations/**/*.graphql"],
  generates: {
    "src/infrastructure/graphql/generated.ts": {
      plugins: [
        "typescript",
        { "typescript-operations": { typesPrefix: "Operation" } },
        "typescript-react-apollo",
      ],
      config: { withHooks: true, withComponent: false, withHOC: false, scalars: { DateTime: "string", Int64: "number", Upload: "File" } },
    },
  },
}
export default config
