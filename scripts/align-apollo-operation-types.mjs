import { readFileSync, writeFileSync } from "node:fs"

const path = "src/infrastructure/graphql/generated.ts"
let source = readFileSync(path, "utf8")
const marker = "export const MyCommunitiesDocument"
const start = source.indexOf(marker)
if (start < 0) throw new Error("Apollo documents not found; check codegen output")
const names = [...source.matchAll(/export type Operation([A-Za-z0-9]+)\s*=/g)]
  .map((match) => match[1])
  .filter((name) => /(Query|Mutation)(Variables)?$/.test(name))
let hooks = source.slice(start)
for (const name of names) {
  hooks = hooks.replace(new RegExp(`(?<!Operation)\\b${name}\\b`, "g"), `Operation${name}`)
}
// Apollo Client 4 no longer exports the legacy mutation aliases from the root
// package and does not expose BaseMutationOptions from its React entry point.
// Preserve generated public type names while using the React hook's types.
hooks = hooks.replace(/\\bApollo\\.MutationFunction</g, "ApolloReactHooks.useMutation.MutationFunction<")
hooks = hooks.replace(/\\bApolloReactHooks\\.BaseMutationOptions</g, "ApolloReactHooks.useMutation.Options<")
source = source.slice(0, start) + hooks
writeFileSync(path, source)
