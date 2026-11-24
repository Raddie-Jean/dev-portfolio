import assert from "node:assert/strict";
import { access, readdir, stat } from "node:fs/promises";
import test from "node:test";

const workerModule = new URL("../dist/server/index.js", import.meta.url);
const publicRoot = new URL("../public/", import.meta.url);
const maxStaticAssetBytes = 25 * 1024 * 1024;
const caseSlugs = [
  "credit-activity",
  "balance-activity",
  "growth-design-archive",
  "daily-lazcash",
  "xiaolu-medical",
  "perxio-research",
  "hapopus-haptics",
  "dance-plus",
  "wildsit-game",
];

let workerPromise;

async function getWorker() {
  workerPromise ??= import(`${workerModule.href}?test=${Date.now()}`);
  return (await workerPromise).default;
}

async function render(pathname) {
  const worker = await getWorker();
  return worker.fetch(
    new Request(`http://localhost${pathname}`, {
      headers: { accept: "text/html" },
    }),
    {
      ASSETS: {
        fetch: async () => new Response("Not found", { status: 404 }),
      },
    },
    {
      waitUntil() {},
      passThroughOnException() {},
    },
  );
}

async function collectFiles(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    const path = new URL(`${entry.name}${entry.isDirectory() ? "/" : ""}`, directory);
    if (entry.isDirectory()) {
      files.push(...(await collectFiles(path)));
    } else if (entry.isFile()) {
      files.push(path);
    }
  }

  return files;
}

test("server-renders the current portfolio homepage", async () => {
  const response = await render("/");
  assert.equal(response.status, 200);
  assert.match(response.headers.get("content-type") ?? "", /^text\/html\b/i);

  const html = await response.text();
  assert.match(html, /<html lang="zh-CN">/i);
  assert.match(html, /<title>Jean — Experience Designer<\/title>/i);
  assert.match(html, /Jean 的个人作品集/);
  assert.match(html, /LOADING JEAN(?:&#x27;|')S WORLD/);
  assert.doesNotMatch(html, /Your site is taking shape|codex-preview|react-loading-skeleton/i);
});

test("server-renders the public lab and all case routes", async () => {
  const labResponse = await render("/lab");
  assert.equal(labResponse.status, 200);
  assert.match(await labResponse.text(), /More Cases|AI Lab/i);

  for (const slug of caseSlugs) {
    const response = await render(`/work/${slug}`);
    assert.equal(response.status, 200, `expected /work/${slug} to render`);
    const html = await response.text();
    assert.match(html, /<title>[^<]+· Jean<\/title>/i);
    assert.doesNotMatch(html, /Your site is taking shape|codex-preview/i);
  }
});

test("keeps unknown case routes as 404 responses", async () => {
  const response = await render("/work/not-a-real-case");
  assert.equal(response.status, 404);
});

test("lists Xiaolu pages in source PNG order (68 through 81)", async () => {
  const response = await render("/work/xiaolu-medical");
  assert.equal(response.status, 200);
  const html = await response.text();
  const rail = html.match(/<aside class="document-thumbnail-rail"[^>]*>(.*?)<\/aside>/s)?.[1];
  assert.ok(rail, "expected a server-rendered thumbnail rail");
  const pages = Array.from(rail.matchAll(/src="\/(case-pages\/v2\/xiaolu-medical\/page-\d+\.jpg)"/g), ([, src]) => src);
  const expected = [1, 2, 3, 4, 6, 5, 8, 9, 10, 11, 7, 14, 13, 12];
  assert.deepEqual(pages, expected.map((page) => `case-pages/v2/xiaolu-medical/page-${String(page).padStart(2, "0")}.jpg`));
  await Promise.all(pages.map((page) => access(new URL(page, publicRoot))));
});

test("keeps the homepage and Lab on lightweight display assets", async () => {
  const homeHtml = await (await render("/")).text();
  const labHtml = await (await render("/lab")).text();
  assert.match(homeHtml, /intro-background-mobile\.webp/);
  assert.match(labHtml, /raddie-cosmic-garden-mobile\.webp/);
  assert.match(labHtml, /clear-pouch-v2\.webp/);
  assert.doesNotMatch(homeHtml, /cover-free\.png/);

  const labMedia = await collectFiles(new URL("assets/lab/optimized/", publicRoot));
  const totalBytes = (await Promise.all(labMedia.map((file) => stat(file))))
    .reduce((sum, file) => sum + file.size, 0);
  assert.ok(totalBytes > 0 && totalBytes < 1_000_000, `Lab display assets: ${totalBytes} bytes`);
  assert.ok((await stat(new URL("fonts/inter/inter-latin.woff2", publicRoot))).size < 65_536);
});

test("keeps required public assets available and under the Cloudflare file limit", async () => {
  const requiredAssets = [
    "favicon.svg",
    "og.png",
    "assets/home/luobogou-opening.mp4",
    "assets/work-media/ip-animation.mp4",
    "assets/work-media/mini-game-demo.mp4",
    "assets/work-media/dance-plus.mp4",
    "documents/jean-resume.pdf",
    "case-pages/v2/credit-activity/page-01.jpg",
    "cases/projects/credit-activity/cover-square.png",
  ];

  for (const relativePath of requiredAssets) {
    await access(new URL(relativePath, publicRoot));
  }

  const files = await collectFiles(publicRoot);
  const oversizedFiles = [];

  for (const file of files) {
    const fileStats = await stat(file);
    if (fileStats.size > maxStaticAssetBytes) {
      oversizedFiles.push(`${file.pathname} (${fileStats.size} bytes)`);
    }
  }

  assert.deepEqual(oversizedFiles, []);
});
