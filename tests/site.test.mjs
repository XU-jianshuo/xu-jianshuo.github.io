import test from "node:test";
import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import { readFile } from "node:fs/promises";
import path from "node:path";

const pairs = [
  ["index.html", "en/index.html"],
  ["experience/index.html", "en/experience/index.html"],
  ["projects/index.html", "en/projects/index.html"],
  ["projects/accident-reform/index.html", "en/projects/accident-reform/index.html"],
  ["projects/non-auto-quality/index.html", "en/projects/non-auto-quality/index.html"],
  ["projects/renewal-operations/index.html", "en/projects/renewal-operations/index.html"],
  ["projects/platform-integration/index.html", "en/projects/platform-integration/index.html"],
  ["projects/cost-management/index.html", "en/projects/cost-management/index.html"],
  ["insights/index.html", "en/insights/index.html"],
  ["insights/insurance-management/index.html", "en/insights/insurance-management/index.html"],
  ["about/index.html", "en/about/index.html"],
];

const pages = pairs.flat();

test("all planned pages and publishing files exist", () => {
  for (const file of [
    ...pages,
    "404.html",
    "robots.txt",
    "sitemap.xml",
    ".nojekyll",
    ".github/workflows/pages.yml",
  ]) {
    assert.equal(existsSync(file), true, `${file} is missing`);
  }
});

test("pages are semantic, titled and linked to shared styles", async () => {
  for (const file of [...pages, "404.html"]) {
    const html = await readFile(file, "utf8");
    assert.match(html, /<!doctype html>/i, `${file}: doctype`);
    assert.match(html, /<html[^>]+lang="[^"]+"/i, `${file}: language`);
    assert.match(html, /<title>[^<]+<\/title>/i, `${file}: title`);
    assert.match(html, /<meta\s+name="description"\s+content="[^"]+"/i, `${file}: description`);
    assert.match(html, /<main[\s>]/i, `${file}: main landmark`);
    assert.match(html, /assets\/css/i, `${file}: shared CSS`);
  }
});

test("language pairs expose alternate-language metadata", async () => {
  for (const [zhPath, enPath] of pairs) {
    const [zh, en] = await Promise.all([readFile(zhPath, "utf8"), readFile(enPath, "utf8")]);
    assert.match(zh, /lang="zh-CN"/i, `${zhPath}: Chinese lang`);
    assert.match(en, /lang="en"/i, `${enPath}: English lang`);
    assert.match(zh, /hreflang="en"/i, `${zhPath}: English hreflang`);
    assert.match(en, /hreflang="zh-CN"/i, `${enPath}: Chinese hreflang`);
  }
});

test("home pages expose the expertise anchor", async () => {
  for (const file of ["index.html", "en/index.html"]) {
    const html = await readFile(file, "utf8");
    assert.match(html, /id="expertise"/i, `${file}: #expertise`);
  }
});

test("public HTML does not disclose restricted data", async () => {
  for (const file of [...pages, "404.html"]) {
    const html = await readFile(file, "utf8");
    assert.doesNotMatch(html, /18926485677/, `${file}: full phone leaked`);
    assert.doesNotMatch(html, /1989\s*年?\s*10\s*月?/i, `${file}: birth date leaked`);
    assert.doesNotMatch(html, /保单成本\s*90%/i, `${file}: ambiguous metric used`);
  }
});

test("root-relative internal links resolve", async () => {
  for (const file of pages) {
    const html = await readFile(file, "utf8");
    const hrefs = [...html.matchAll(/href="(\/[^"]*)"/gi)].map((match) => match[1]);
    for (const href of hrefs) {
      const clean = href.split("#")[0].split("?")[0];
      if (!clean) continue;
      const target = clean.endsWith("/") ? `${clean.slice(1)}index.html` : clean.slice(1);
      assert.equal(existsSync(path.normalize(target)), true, `${file}: broken link ${href}`);
    }
  }
});

test("crawler metadata targets the public site", async () => {
  const [robots, sitemap] = await Promise.all([
    readFile("robots.txt", "utf8"),
    readFile("sitemap.xml", "utf8"),
  ]);
  assert.match(robots, /https:\/\/xu-jianshuo\.github\.io\/sitemap\.xml/);
  assert.match(sitemap, /https:\/\/xu-jianshuo\.github\.io\//);
  assert.match(sitemap, /hreflang="zh-CN"/);
  assert.match(sitemap, /hreflang="en"/);
});

