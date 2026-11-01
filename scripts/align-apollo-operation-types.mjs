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
source = source.slice(0, start) + hooks
// GraphQL Code Generator emits broad @ts-ignore on Suspense overloads.
// Use the narrower directive so obsolete suppressions surface during type checking.
source = source.replaceAll("// @ts-ignore", "// @ts-expect-error")
writeFileSync(path, source)
