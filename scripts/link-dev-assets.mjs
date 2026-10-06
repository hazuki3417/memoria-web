import { lstat, mkdir, readlink, rm, symlink } from "node:fs/promises"
import { dirname, relative, resolve } from "node:path"

const source = resolve("storybook-assets")
const target = resolve("public/__dev-assets")
const expected = relative(dirname(target), source)

await mkdir(dirname(target), { recursive: true })

try {
  const stat = await lstat(target)
  if (stat.isSymbolicLink() && (await readlink(target)) === expected) {
    process.exit(0)
  }
  await rm(target, { recursive: true, force: true })
} catch (error) {
  if (error.code !== "ENOENT") throw error
}

await symlink(expected, target, process.platform === "win32" ? "junction" : "dir")
