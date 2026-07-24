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
const chineseOnlyPages = [
  "insights/non-auto-product-system/index.html",
  "insights/h2-non-auto-six-actions/index.html",
];
const allPublicPages = [...pages, ...chineseOnlyPages, "404.html"];

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
  for (const file of allPublicPages) {
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
  for (const file of allPublicPages) {
    const html = await readFile(file, "utf8");
    assert.doesNotMatch(html, /18926485677/, `${file}: full phone leaked`);
    assert.doesNotMatch(html, /1989\s*年?\s*10\s*月?/i, `${file}: birth date leaked`);
    assert.doesNotMatch(html, /保单成本\s*90%/i, `${file}: ambiguous metric used`);
  }
});

test("root-relative internal links resolve", async () => {
  for (const file of [...pages, ...chineseOnlyPages]) {
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

test("non-auto report covers the ten professional scenarios", async () => {
  const html = await readFile("insights/non-auto-product-system/index.html", "utf8");
  const scenarios = [
    "车主延伸与随车经营",
    "两轮出行",
    "健康与员工福利",
    "校园少儿",
    "旅游出行与航空平台",
    "文娱赛事与高风险运动",
    "居家、物业与租住",
    "金融银行战略渠道",
    "政务综治与区域民生",
    "消费权益与数码设备",
  ];
  for (const scenario of scenarios) assert.match(html, new RegExp(scenario), scenario);
  for (const dimension of ["入口", "产品", "新保", "续保", "风控"]) {
    assert.match(html, new RegExp(dimension), `missing dimension: ${dimension}`);
  }
});

test("H2 report exposes schedule, actions, metrics and expected effects", async () => {
  const html = await readFile("insights/h2-non-auto-six-actions/index.html", "utf8");
  for (const content of [
    "2026 年 7—12 月",
    "4.6",
    "34%",
    "50%",
    "3 件",
    "5 件",
    "20%",
    "40%",
    "预期效果",
  ]) {
    assert.match(html, new RegExp(content.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")), content);
  }
  assert.equal((html.match(/class="action-card"/g) || []).length, 6);
});

test("reports expose progressive enhancement hooks", async () => {
  for (const file of chineseOnlyPages) {
    const html = await readFile(file, "utf8");
    assert.match(html, /data-report-nav/);
    assert.match(html, /data-reading-progress/);
    assert.match(html, /assets\/js\/report\.js/);
  }
});

test("sitemap includes the new Chinese reports", async () => {
  const sitemap = await readFile("sitemap.xml", "utf8");
  assert.match(sitemap, /insights\/non-auto-product-system\//);
  assert.match(sitemap, /insights\/h2-non-auto-six-actions\//);
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
