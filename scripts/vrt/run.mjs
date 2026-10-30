import { spawn } from "node:child_process";
import { mkdir, rm, writeFile } from "node:fs/promises";
import { join } from "node:path";

const root = process.cwd();
const output = join(root, "tests/vrt/generated");
const url = "http://127.0.0.1:6006/index.json";
const groupFilter = process.env.VRT_GROUP?.toLowerCase();
const update = process.argv.includes("--update-snapshots");
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

function start(command, args) {
  return spawn(command, args, { cwd: root, env: process.env, stdio: "inherit", shell: process.platform === "win32" });
}
async function indexReady(timeoutMs = 120_000) {
  const started = Date.now();
  while (Date.now() - started < timeoutMs) {
    try {
      const res = await fetch(url);
      if (res.ok) return res.json();
    } catch { /* Storybook is starting */ }
    await sleep(1000);
  }
  throw new Error("Storybook index.json was not ready within 120 seconds");
}
function groupOf(entry) {
  // Storybook title is the source of truth; component grouping is optional.
  const segments = (entry.title ?? "").split("/");
  const rootGroup = segments[0]?.toLowerCase();
  if (rootGroup === "components" || rootGroup === "features") {
    return [rootGroup, segments[1]?.toLowerCase() || "_other"].join("/");
  }
  return ["other", rootGroup || "_other"].join("/");
}
function safeName(value) { return value.replace(/[^a-z0-9-]/gi, "-"); }

let server;
try {
  // A single Storybook instance serves both index discovery and all Playwright cases.
  server = start("npm", ["run", "dev:storybook", "--", "--ci", "--no-open"]);
  const index = await indexReady();
  const stories = Object.values(index.entries ?? {})
    .filter((entry) => entry.type === "story" && entry.tags?.includes("vrt"))
    .sort((a, b) => a.id.localeCompare(b.id));
  if (!stories.length) throw new Error("No vrt-tagged stories found");
  const groups = new Map();
  for (const entry of stories) {
    const group = groupOf(entry);
    if (groupFilter && group !== groupFilter && !group.startsWith(groupFilter + "/")) continue;
    if (!groups.has(group)) groups.set(group, []);
    groups.get(group).push({ id: entry.id, tags: entry.tags });
  }
  if (!groups.size) throw new Error(`No VRT cases for group: ${groupFilter || "(all)"}`);
  await rm(output, { recursive: true, force: true });
  await mkdir(output, { recursive: true });
  for (const [group, entries] of groups) {
    const source = `import { test } from "@playwright/test";
import { captureStory } from "../capture";
import { responsiveViewports } from "../../../.storybook/responsiveViewports";

const cases = ${JSON.stringify(entries, null, 2)};
const viewports = [responsiveViewports.compact, responsiveViewports.medium, responsiveViewports.wide];
test.describe(${JSON.stringify(group)}, () => {
  for (const story of cases) {
    for (const viewport of viewports) {
      test(\`\${story.id} / \${viewport.name}\`, async ({ page }) => {
        await captureStory(page, story, viewport);
      });
    }
  }
});
`;
    await writeFile(join(output, safeName(group) + ".spec.ts"), source);
  }
  console.log(`VRT: ${[...groups.values()].flat().length} stories in ${groups.size} groups`);
  const args = ["playwright", "test", "--config=playwright.vrt.config.ts"];
  if (update) args.push("--update-snapshots");
  const playwright = start("npx", args);
  const code = await new Promise((resolve) => playwright.on("exit", (code) => resolve(code ?? 1)));
  process.exitCode = code;
} catch (error) {
  console.error(error);
  process.exitCode = 1;
} finally {
  if (server) server.kill("SIGTERM");
}
