import { CodegenConfig } from '@graphql-codegen/cli'

const config: CodegenConfig = {
  schema: 'src/graphql/schema/**/*.graphql',
  documents: 'src/graphql/operation/**/*.graphql',
  generates: {
    "./src/graphql/gql/": {
      preset: "client",
    }
  }
}
export default config
