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

test("homepage career timeline keeps roles as separate appointments", async () => {
  const zh = await readFile("index.html", "utf8");
  const zhText = zh.replace(/<[^>]+>/g, "");
  for (const role of [
    "大家财产保险有限责任公司 · 车险部 · 个非推动处 · 高级经理",
    "大家财产保险有限责任公司 · 车险部 · 续保管理室 · 高级经理",
    "大家财产保险有限责任公司 · 车险部 · 运营管理室 · 高级经理",
    "中国平安财产保险股份有限公司 · 个人非车险部 · 财意产品室 · 精算经理",
    "中国平安财产保险股份有限公司 · 车代管理部 · 业绩发展室 · 经理",
    "中国平安保险（集团）股份有限公司 · 战略企划部 · 保险企划室 · 企划岗",
    "中国平安财产保险股份有限公司 · 精算部 · 评估室 · 精算岗",
  ]) {
    assert.match(zhText, new RegExp(role), `index.html: missing role ${role}`);
  }
  assert.doesNotMatch(zhText, /公司：|部门：|科室：|岗位：|career-fields/);
  assert.doesNotMatch(zhText, /运营管理室\s*\/\s*续保管理室|运营管理\s*\/\s*续保管理/);
  assert.doesNotMatch(zhText, /精算、企划与车商渠道|车商渠道|室经理/);
  assert.doesNotMatch(zhText, /战略企划部企划岗|战略企划部\s*·\s*企划岗/);

  const en = await readFile("en/index.html", "utf8");
  for (const role of [
    "Non-auto Promotion Office",
    "Renewal Management Office",
    "Operations Management Office",
    "Personal Non-auto Product Office",
    "Performance Development Office",
    "Strategic Planning Department",
    "Actuarial Department",
  ]) {
    assert.match(en, new RegExp(role), `en/index.html: missing role ${role}`);
  }
});

test("public HTML does not disclose restricted data", async () => {
  for (const file of allPublicPages) {
    const html = await readFile(file, "utf8");
    assert.doesNotMatch(html, /18926485677/, `${file}: full phone leaked`);
    assert.doesNotMatch(html, /1989\s*年?\s*10\s*月?/i, `${file}: birth date leaked`);
    assert.doesNotMatch(html, /保单成本\s*90%/i, `${file}: ambiguous metric used`);
    assert.doesNotMatch(html, /4\.6\s*亿|4\.6\s*亿元/, `${file}: internal premium target leaked`);
    assert.doesNotMatch(html, /34%\s*提升到\s*50%|34%→50%/, `${file}: internal opening-rate target leaked`);
    assert.doesNotMatch(html, /3\s*件\s*提升到\s*5\s*件|人均\s*3→5\s*件/, `${file}: internal productivity target leaked`);
    assert.doesNotMatch(html, /20%\s*提升到\s*40%|20%→40%/, `${file}: internal renewal target leaked`);
    assert.doesNotMatch(html, /市场个非车产品体系介绍|黑产客群/, `${file}: internal source or sensitive wording leaked`);
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

test("H2 report is public-method focused", async () => {
  const html = await readFile("insights/h2-non-auto-six-actions/index.html", "utf8");
  for (const content of [
    "个非车业务增长的",
    "六个观察维度",
    "入口",
    "产品",
    "系统",
    "过程指标",
    "续保",
    "风险边界",
  ]) {
    assert.match(html, new RegExp(content.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")), content);
  }
  assert.equal((html.match(/class="report-section"/g) || []).length, 6);
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
