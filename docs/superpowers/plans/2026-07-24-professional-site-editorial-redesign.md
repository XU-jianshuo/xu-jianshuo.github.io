# Professional Site Editorial Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rebuild the Chinese personal site as a black, white, and orange professional portfolio and publish two detailed, responsive work reports covering the ten non-auto scenarios and the six 2026 H2 actions.

**Architecture:** Keep the existing zero-build static HTML/CSS/JavaScript architecture. Add two Chinese-only report routes, extend the shared design system with editorial-report components, and progressively enhance navigation, filtering, disclosure, reading progress, and count-up metrics while preserving complete no-JavaScript content.

**Tech Stack:** Semantic HTML5, shared CSS custom properties, native JavaScript, Node.js built-in test runner, Playwright CLI, GitHub Pages.

---

## File map

### Create

- `insights/non-auto-product-system/index.html` — complete ten-scenario report and product operating cards.
- `insights/h2-non-auto-six-actions/index.html` — complete H2 six-action report and monthly roadmap.
- `assets/js/report.js` — report navigation, disclosure, progress, filtering, and metric animation.
- `assets/images/editorial/portrait-placeholder.jpg` — replaceable temporary hero portrait.
- `assets/images/editorial/non-auto-cover.jpg` — non-auto product-system cover.
- `assets/images/editorial/h2-actions-cover.jpg` — H2 action-plan cover.
- `assets/images/editorial/scenario-*.jpg` — local scenario imagery.
- `docs/source-map/non-auto-ppt-to-web.md` — slide-to-section coverage ledger.

### Modify

- `index.html` — new Chinese homepage.
- `insights/index.html` — add the two recent-work reports.
- `assets/css/tokens.css` — black/white/orange design tokens.
- `assets/css/base.css` — typography, focus, dark mode, and global resets.
- `assets/css/components.css` — header, cards, buttons, timeline, filters, report navigation.
- `assets/css/pages.css` — homepage and report-specific layouts.
- `assets/js/navigation.js` — mobile menu and theme persistence.
- `assets/js/motion.js` — reveal/count animation with reduced-motion handling.
- `sitemap.xml` — add new Chinese URLs.
- `tests/site.test.mjs` — verify new pages, required content, accessibility hooks, and links.

### Preserve

- `en/**` — no new English translation in this iteration.
- `projects/**`, `experience/**`, `about/**` — remain valid and linked.
- `gefei/**` if present in the source repository — no edits.

## Task 1: Lock content coverage with failing tests

**Files:**
- Modify: `tests/site.test.mjs`
- Create: `docs/source-map/non-auto-ppt-to-web.md`

- [ ] **Step 1: Add the new Chinese reports to the page inventory**

Add:

```js
const chineseOnlyPages = [
  "insights/non-auto-product-system/index.html",
  "insights/h2-non-auto-six-actions/index.html",
];

const allPublicPages = [...pages, ...chineseOnlyPages, "404.html"];
```

Use `allPublicPages` in semantic, link-resolution, and disclosure tests. Do not add the two routes to `pairs`, because English translation is explicitly deferred.

- [ ] **Step 2: Add content-contract tests**

Add:

```js
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
  assert.equal((html.match(/class="action-card/g) || []).length, 6);
});
```

- [ ] **Step 3: Add interaction and metadata contracts**

Add:

```js
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
```

- [ ] **Step 4: Run tests and verify the new contracts fail**

Run:

```powershell
node --test tests/site.test.mjs
```

Expected: existing tests pass; failures report both missing report files and missing sitemap URLs.

- [ ] **Step 5: Create the source coverage ledger**

Write `docs/source-map/non-auto-ppt-to-web.md` with this exact table structure:

```markdown
| PPT source | Slides | Web section | Coverage |
| --- | ---: | --- | --- |
| 市场个非车产品体系介绍 | 2–5 | 总论、业务地图、六步闭环、产品地图 | Full |
| 市场个非车产品体系介绍 | 6–16 | 车主延伸与两轮出行 | Full |
| 市场个非车产品体系介绍 | 17–24 | 健康与校园少儿 | Full |
| 市场个非车产品体系介绍 | 25–33 | 旅游、航空、赛事与高风险运动 | Full |
| 市场个非车产品体系介绍 | 34–38 | 居家、物业与租住 | Full |
| 市场个非车产品体系介绍 | 39–44 | 金融银行与文娱演艺 | Full |
| 市场个非车产品体系介绍 | 45–52 | 政务民生、消费权益、集团协同 | Full |
| 市场个非车产品体系介绍 | 53–54 | 分公司落地与风险红线 | Full |
| 半年会补充-个非车落地举措 | 9–12 | 六件事、指标、时间线、系统与组织 | Full |
```

- [ ] **Step 6: Commit the contracts**

```powershell
git add tests/site.test.mjs docs/source-map/non-auto-ppt-to-web.md
git commit -m "test: define editorial report content contracts"
```

## Task 2: Prepare local visual assets

**Files:**
- Create: `assets/images/editorial/*.jpg`
- Modify: `docs/source-map/non-auto-ppt-to-web.md`

- [ ] **Step 1: Render both source decks for visual inventory**

Run the presentation rendering helper into an external temporary workspace:

```powershell
$skill = "C:\Users\86777\.codex\plugins\cache\openai-primary-runtime\presentations\26.723.12215\skills\presentations"
$scratch = Join-Path $env:TEMP "codex-presentations\professional-site"
New-Item -ItemType Directory -Force -Path $scratch | Out-Null
python "$skill\container_tools\render_slides.py" "C:\Users\86777\Desktop\工作项目\【20260707】个非车业务地图\市场个非车产品体系介绍.pptx"
python "$skill\container_tools\render_slides.py" "D:\WXwork\WXWork\1688855281508703\Cache\File\2026-07\半年会补充-个非车落地举措.pptx"
```

Expected: rendered PNGs exist for all 54 and 12 slides.

- [ ] **Step 2: Inventory source-deck media**

Extract media from each PPTX archive into the external scratch directory and record which assets are reusable. Do not copy whole-slide screenshots into the site.

Expected reusable groups:

- transportation and vehicle icons;
- family, health, travel, school, finance, community, and device icons;
- flow arrows and section marks;
- any non-confidential illustrations that remain legible outside the deck.

- [ ] **Step 3: Source replaceable stock photography**

Use image search for:

- professional Chinese male business portrait;
- automotive insurance/vehicle handover;
- family health consultation;
- school and children;
- airport/travel;
- city community/property;
- banking/financial service;
- smartphone/device protection.

Download selected permissively licensed images to `assets/images/editorial/`. Record source URLs and licenses in `docs/source-map/non-auto-ppt-to-web.md`.

- [ ] **Step 4: Optimize images**

Keep each JPG below 350 KB where practical and use dimensions appropriate for its crop. Use fixed names:

```text
portrait-placeholder.jpg
non-auto-cover.jpg
h2-actions-cover.jpg
scenario-auto.jpg
scenario-two-wheel.jpg
scenario-health.jpg
scenario-school.jpg
scenario-travel.jpg
scenario-sport.jpg
scenario-home.jpg
scenario-finance.jpg
scenario-community.jpg
scenario-device.jpg
```

- [ ] **Step 5: Commit visual assets**

```powershell
git add assets/images/editorial docs/source-map/non-auto-ppt-to-web.md
git commit -m "assets: add editorial report imagery"
```

## Task 3: Build the shared black-white-orange design system

**Files:**
- Modify: `assets/css/tokens.css`
- Modify: `assets/css/base.css`
- Modify: `assets/css/components.css`
- Modify: `assets/css/pages.css`
- Modify: `assets/js/navigation.js`

- [ ] **Step 1: Add palette and scale tokens**

Define:

```css
:root {
  --ink: #171717;
  --ink-soft: #242424;
  --paper: #fffdf9;
  --paper-muted: #f3f1ed;
  --accent: #ff5a36;
  --accent-strong: #ed3f1c;
  --danger: #c72b1c;
  --line: #d9d5cf;
  --text: #1b1b1b;
  --muted: #66625d;
  --radius-sm: 16px;
  --radius-md: 28px;
  --radius-lg: 42px;
  --shadow-card: 0 24px 70px rgba(24, 20, 16, 0.12);
  --container: 1180px;
}
```

Retain existing token aliases where English pages depend on them.

- [ ] **Step 2: Add accessible global styling**

Implement:

```css
:focus-visible {
  outline: 3px solid var(--accent);
  outline-offset: 4px;
}

@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    scroll-behavior: auto !important;
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

Ensure body text remains at least 16px and line height at least 1.65.

- [ ] **Step 3: Add shared editorial components**

Create styles for:

- `.pill-nav`
- `.hero-portrait`
- `.credential-stat`
- `.service-card`
- `.career-timeline`
- `.work-feature`
- `.report-hero`
- `.report-meta`
- `.report-nav`
- `.business-loop`
- `.scenario-card`
- `.scenario-matrix`
- `.product-card`
- `.action-card`
- `.roadmap`
- `.risk-panel`
- `.reading-progress`

Use horizontal overflow for matrices below 760px and one-column cards below 680px.

- [ ] **Step 4: Preserve navigation behavior**

Update `navigation.js` so the theme button persists:

```js
const themeButton = document.querySelector("[data-theme-toggle]");
const storedTheme = localStorage.getItem("site-theme");
if (storedTheme) document.documentElement.dataset.theme = storedTheme;

themeButton?.addEventListener("click", () => {
  const next = document.documentElement.dataset.theme === "dark" ? "light" : "dark";
  document.documentElement.dataset.theme = next;
  localStorage.setItem("site-theme", next);
  themeButton.setAttribute("aria-pressed", String(next === "dark"));
});
```

- [ ] **Step 5: Run existing tests**

```powershell
node --test tests/site.test.mjs
```

Expected: failures remain only for not-yet-created report pages and sitemap entries.

- [ ] **Step 6: Commit design-system work**

```powershell
git add assets/css assets/js/navigation.js
git commit -m "feat: add editorial portfolio design system"
```

## Task 4: Rebuild the Chinese homepage

**Files:**
- Modify: `index.html`

- [ ] **Step 1: Replace the header with the pill navigation**

Keep `id="expertise"` and all valid internal routes. Include a working mobile button, theme button, and `/en/` link.

- [ ] **Step 2: Build the portrait hero**

Use:

```html
<section class="portfolio-hero" aria-labelledby="hero-title">
  <div class="portfolio-hero__intro">
    <p class="eyebrow">Hello / Insurance Practice</p>
    <h1 id="hero-title">徐建硕</h1>
    <p class="portfolio-hero__role">财产保险经营、精算与风险管理</p>
  </div>
  <div class="portfolio-hero__stage">
    <aside class="credential-stat"><strong>10+ 年</strong><span>财产险实践</span></aside>
    <figure class="hero-portrait">
      <span class="hero-portrait__disc" aria-hidden="true"></span>
      <img src="/assets/images/editorial/portrait-placeholder.jpg" alt="职业肖像占位图，后续替换为徐建硕本人照片">
    </figure>
    <aside class="credential-stat"><strong>FCAA · FRM · CPA</strong><span>复合专业资质</span></aside>
  </div>
</section>
```

- [ ] **Step 3: Build three service cards under `#expertise`**

Each card links a professional area to supporting projects and uses local imagery.

- [ ] **Step 4: Build the career timeline and evidence metrics**

Show four career stages and metrics that are explicitly supported by the resume or PPTs.

- [ ] **Step 5: Build two recent-work feature panels**

Each panel includes `2026.07—2026.12`, current stage, role, expected effect, key metrics, and its report link.

- [ ] **Step 6: Build professional judgment cards and contact panel**

Use the four approved judgments. Keep email, Shenzhen, credentials, and GitHub; do not add a fake form.

- [ ] **Step 7: Run tests**

```powershell
node --test tests/site.test.mjs
```

Expected: `home pages expose the expertise anchor` passes; report-route failures remain.

- [ ] **Step 8: Commit the homepage**

```powershell
git add index.html
git commit -m "feat: redesign Chinese professional homepage"
```

## Task 5: Build the ten-scenario report

**Files:**
- Create: `insights/non-auto-product-system/index.html`

- [ ] **Step 1: Create semantic report shell**

Include title, description, canonical URL, Chinese language metadata, theme initialization, shared styles, navigation, reading progress, main landmark, and footer.

- [ ] **Step 2: Add report hero and project metadata**

Display 2026.07—2026.12, role, current phase, deliverables, expected effect, and source-material note.

- [ ] **Step 3: Add the six-step operating loop**

Each step must include objective, action, output, and risk. Use an ordered list so no-JavaScript users receive the complete sequence.

- [ ] **Step 4: Add the ten scenario sections**

Each `.scenario-card` must contain five labeled fields:

```html
<dl class="scenario-card__facts">
  <div><dt>入口</dt><dd>...</dd></div>
  <div><dt>产品</dt><dd>...</dd></div>
  <div><dt>新保</dt><dd>...</dd></div>
  <div><dt>续保</dt><dd>...</dd></div>
  <div><dt>风控</dt><dd>...</dd></div>
</dl>
```

Use the exact ten scenarios from the design specification.

- [ ] **Step 5: Add product cards**

Include at least ten product cards with product value, target customer, trigger, cover structure, underwriting, risk, service, renewal, and metric fields.

- [ ] **Step 6: Add implementation roadmap and red-line panel**

Show “找入口、建清单、配方案、抓续保”, headquarters/branch/front-line responsibilities, and the approved prohibitions.

- [ ] **Step 7: Run the targeted contract**

```powershell
node --test --test-name-pattern="non-auto report" tests/site.test.mjs
```

Expected: PASS.

- [ ] **Step 8: Commit the report**

```powershell
git add insights/non-auto-product-system/index.html
git commit -m "feat: publish non-auto product operating system report"
```

## Task 6: Build the H2 six-action report

**Files:**
- Create: `insights/h2-non-auto-six-actions/index.html`

- [ ] **Step 1: Create report shell and target dashboard**

Include 4.6亿元, 2.1亿元, 2.0亿元, and the innovation increment with context labels rather than isolated numbers.

- [ ] **Step 2: Add exactly six action cards**

Every `.action-card` contains:

- background;
- 2026 timing;
- target customer/institution;
- action owner;
- product/project plan;
- systems and data;
- quantitative target;
- expected effect;
- risk and review.

- [ ] **Step 3: Add the monthly roadmap**

Use July through December with the approved milestones. Keep the months visible without JavaScript.

- [ ] **Step 4: Add organization and tool architecture**

Show product engine, rule engine, sales systems, BI, renewal system, branch promoter, and three-level coordination.

- [ ] **Step 5: Run the targeted contract**

```powershell
node --test --test-name-pattern="H2 report" tests/site.test.mjs
```

Expected: PASS with exactly six `.action-card` occurrences.

- [ ] **Step 6: Commit the report**

```powershell
git add insights/h2-non-auto-six-actions/index.html
git commit -m "feat: publish 2026 H2 non-auto action report"
```

## Task 7: Add report interactions and discovery

**Files:**
- Create: `assets/js/report.js`
- Modify: `insights/index.html`
- Modify: `assets/js/motion.js`
- Modify: `sitemap.xml`
- Modify: `tests/site.test.mjs`

- [ ] **Step 1: Implement reading progress and section highlighting**

Use:

```js
const progress = document.querySelector("[data-reading-progress]");
const updateProgress = () => {
  const scrollable = document.documentElement.scrollHeight - innerHeight;
  const value = scrollable > 0 ? Math.min(1, scrollY / scrollable) : 0;
  progress?.style.setProperty("--reading-progress", String(value));
};
addEventListener("scroll", updateProgress, { passive: true });
updateProgress();
```

Use `IntersectionObserver` to apply `aria-current="location"` to the matching report-nav link.

- [ ] **Step 2: Implement accessible disclosure**

Buttons with `data-disclosure-button` toggle a referenced panel, update `aria-expanded`, and never remove content from the source HTML.

- [ ] **Step 3: Implement scenario/product filtering**

Reuse the existing `data-filter` convention. Default to all content when JavaScript is unavailable.

- [ ] **Step 4: Implement count-up metrics**

Only animate elements with numeric `data-count-to`; immediately display final values under reduced motion.

- [ ] **Step 5: Add report cards to the insights index**

Mark them as `2026 近期工作`, include dates and descriptions, and link to both new routes.

- [ ] **Step 6: Add sitemap entries**

Add canonical Chinese-only `<url>` entries for both reports. Do not add fabricated English alternates.

- [ ] **Step 7: Run full tests**

```powershell
node --test tests/site.test.mjs
```

Expected: all tests pass.

- [ ] **Step 8: Commit discovery and interaction**

```powershell
git add assets/js insights/index.html sitemap.xml tests/site.test.mjs
git commit -m "feat: add editorial report interactions and discovery"
```

## Task 8: Visual QA, final audit, and release

**Files:**
- Modify as required by QA.
- Create: `design-qa.md`

- [ ] **Step 1: Start a local static server**

```powershell
python -m http.server 4173
```

Expected: the site responds at `http://127.0.0.1:4173/`.

- [ ] **Step 2: Capture desktop pages**

Using Playwright CLI at 1440×900, capture:

- `/`
- `/insights/non-auto-product-system/`
- `/insights/h2-non-auto-six-actions/`
- `/en/`

Check navigation, imagery, section rhythm, matrix overflow, and console errors.

- [ ] **Step 3: Capture mobile pages**

Repeat at 390×844. Test the mobile menu, report navigation, disclosure controls, horizontal matrices, and touch target sizes.

- [ ] **Step 4: Verify the full requirement matrix**

Write `design-qa.md` with:

```markdown
final result: passed

- Homepage style: passed
- Ten scenarios and five dimensions: passed
- Six actions with timing, metrics, effect: passed
- PPT visual structures represented: passed
- Existing English and project routes: passed
- Desktop 1440×900: passed
- Mobile 390×844: passed
- Keyboard and reduced motion: passed
- Console errors: none
```

Do not use `passed` until each line has direct screenshot, DOM, test, or browser evidence.

- [ ] **Step 5: Run final automated checks**

```powershell
node --test tests/site.test.mjs
git diff --check
git status --short
```

Expected: tests pass, no whitespace errors, only intended files changed.

- [ ] **Step 6: Commit QA fixes**

```powershell
git add .
git commit -m "fix: complete responsive editorial design QA"
```

- [ ] **Step 7: Push the root-domain repository**

```powershell
git push origin main
```

Expected: `main` advances successfully.

- [ ] **Step 8: Verify GitHub Pages**

Verify 200 responses and current content at:

- `https://xu-jianshuo.github.io/`
- `https://xu-jianshuo.github.io/#expertise`
- `https://xu-jianshuo.github.io/insights/non-auto-product-system/`
- `https://xu-jianshuo.github.io/insights/h2-non-auto-six-actions/`
- `https://xu-jianshuo.github.io/en/`

Confirm the deployment commit is the current root site and the two report URLs contain their required headings.
