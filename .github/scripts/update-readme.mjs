import { readFile, writeFile } from "node:fs/promises";

const USER = "Livicianaa";
const LIMIT = 4;
const SKIP = /^(ornek-|tanitim-)/i;
const README = "README.md";

const headers = { "User-Agent": USER, Accept: "application/vnd.github+json" };
if (process.env.GITHUB_TOKEN) headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;

const res = await fetch(`https://api.github.com/users/${USER}/repos?sort=pushed&per_page=30`, { headers });
if (!res.ok) throw new Error(`GitHub API ${res.status}: ${await res.text()}`);

const repos = (await res.json())
  .filter((r) => !r.fork && !r.archived && r.name !== USER && !SKIP.test(r.name))
  .slice(0, LIMIT);

const today = new Date().toISOString().slice(0, 10);
const theme = "&theme=tokyonight&hide_border=true";

const cards = repos.map(
  (r) =>
    `  <a href="${r.html_url}"><img src="https://github-readme-stats.vercel.app/api/pin/?username=${USER}&repo=${r.name}${theme}" width="47%" alt="${r.name}"/></a>`
);
const rows = [];
for (let i = 0; i < cards.length; i += 2) rows.push(cards.slice(i, i + 2).join("\n"));

const block = [
  "<!--RECENT:start-->",
  `<!-- updated ${today} -->`,
  '<div align="center">',
  rows.join("\n  <br>\n"),
  "</div>",
  "<!--RECENT:end-->",
].join("\n");

const readme = await readFile(README, "utf8");
const next = readme.replace(/<!--RECENT:start-->[\s\S]*?<!--RECENT:end-->/, block);
if (next === readme) {
  console.log("No changes");
} else {
  await writeFile(README, next);
  console.log(`Updated with ${repos.length} repos`);
}
