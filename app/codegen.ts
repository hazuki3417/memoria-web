import type { CodegenConfig } from "@graphql-codegen/cli";

const config: CodegenConfig = {
  schema: "src/graphql/schema/**/*.graphql",
  documents: "src/graphql/operation/**/*.graphql",
  generates: {
    "./src/graphql/gql/index.ts": {
      plugins: [
        "typescript",
        "typescript-operations",
        "typescript-react-apollo",
      ],
      config: {
        withHooks: true,
        withHOC: false,
        withComponent: false,
        useTypeImports: true,
        scalars: {
          DateTime: "string",
        },
      },
    },
  },
};
export default config;
