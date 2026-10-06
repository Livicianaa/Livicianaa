import { readFile, writeFile } from "node:fs/promises";

const USER = "Livicianaa";
const LIMIT = 5;
const README = "README.md";

const headers = { "User-Agent": USER, Accept: "application/vnd.github+json" };
if (process.env.GITHUB_TOKEN) headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;

const res = await fetch(`https://api.github.com/users/${USER}/repos?sort=pushed&per_page=30`, { headers });
if (!res.ok) throw new Error(`GitHub API ${res.status}: ${await res.text()}`);

const repos = (await res.json())
  .filter((r) => !r.fork && !r.archived && r.name !== USER)
  .slice(0, LIMIT);

const fmt = (iso) => new Date(iso).toISOString().slice(0, 10);
const today = new Date().toISOString().slice(0, 10);

const rows = repos.map((r) => {
  const desc = (r.description || "").replace(/\|/g, "\\|");
  return `| [${r.name}](${r.html_url}) | ${desc} | ${r.language || "-"} | ${fmt(r.pushed_at)} |`;
});

const block = [
  "<!--RECENT:start-->",
  "| Repo | Description | Language | Last push |",
  "| --- | --- | --- | --- |",
  ...rows,
  "",
  `<sub>Auto-updated ${today}</sub>`,
  "<!--RECENT:end-->",
].join("\n");

const readme = await readFile(README, "utf8");
const next = readme.replace(/<!--RECENT:start-->[\s\S]*?<!--RECENT:end-->/, block);
if (next === readme) {
  console.log("No changes");
} else {
  await writeFile(README, next);
  console.log(`Updated with ${rows.length} repos`);
}
