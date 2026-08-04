# DESIGN.md Linear Notion Refresh Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Apply a Linear-led, Notion-readable DESIGN.md visual system to the static digital resume site.

**Architecture:** The site remains static HTML/CSS/JS. The implementation adds a project-level `DESIGN.md`, updates design tokens, then adjusts shared base, component, and page CSS so the existing pages inherit a coherent professional visual language without changing content or routes.

**Tech Stack:** Static HTML, CSS custom properties, vanilla JavaScript, Node test runner.

---

## File Structure

- Create: `DESIGN.md`  
  Defines the local design system distilled from `awesome-design-md/design-md/linear.app/DESIGN.md` and `awesome-design-md/design-md/notion/DESIGN.md`.
- Modify: `assets/css/tokens.css`  
  Replaces warm editorial tokens with Linear-like dark surfaces, lavender accent, smaller radii, and compatibility aliases.
- Modify: `assets/css/base.css`  
  Removes the warm radial decoration, updates typography weights, focus rings, links, and section kicker treatment.
- Modify: `assets/css/components.css`  
  Updates navigation, buttons, reusable cards, credential strips, portrait framing, report panels, and related shared components.
- Modify: `assets/css/pages.css`  
  Updates homepage hero, sections, timeline, work cards, contact banner, report hero, and mobile behavior.
- Test: `tests/site.test.mjs`  
  Existing tests should continue to pass.

## Task 1: Add Project DESIGN.md

**Files:**
- Create: `DESIGN.md`

- [ ] **Step 1: Write the design file**

Create a Markdown file that records the applied rules:

```markdown
# DESIGN.md

This site uses a restrained professional resume system inspired by Linear and Notion DESIGN.md references.

## Principles

- Use a near-black canvas and charcoal surface ladder for the primary experience.
- Use lavender-blue sparingly for primary actions, links, focus states, numbering, and active navigation.
- Use white and light gray text on dark surfaces, with muted gray for supporting copy.
- Preserve Chinese long-form readability with generous body line-height.
- Keep buttons at 8px radius and cards at 8-12px radius.
- Use borders and subtle surface changes for hierarchy instead of large shadows.
- Reserve pill shapes for credentials, tags, and compact status chips.

## Tokens

- Canvas: `#010102`
- Surface 1: `#0f1011`
- Surface 2: `#141516`
- Surface 3: `#18191a`
- Hairline: `#23252a`
- Primary: `#5e6ad2`
- Primary hover: `#828fff`
- Ink: `#f7f8f8`
- Muted ink: `#a6adba`
- Inverse canvas: `#f7f8f8`

## Components

- Navigation: compact sticky dark bar with 8-12px geometry.
- Buttons: rectangular 8px controls, primary lavender and secondary charcoal/outlined.
- Cards: charcoal panels with 1px hairline borders.
- Timeline: dark panels connected by hairline rules.
- Work features: split media/content panels with reduced image saturation.
- Contact: dark CTA panel with lavender emphasis, not a decorative orange banner.

## Source References

- `awesome-design-md/design-md/linear.app/DESIGN.md`
- `awesome-design-md/design-md/notion/DESIGN.md`
```

- [ ] **Step 2: Commit design file with implementation changes**

Do not commit this file alone; include it with the completed implementation commit after tests pass.

## Task 2: Replace Shared Tokens

**Files:**
- Modify: `assets/css/tokens.css`

- [ ] **Step 1: Replace root variables**

Set the root tokens to the new system:

```css
:root {
  --ink: #f7f8f8;
  --ink-soft: #d0d6e0;
  --paper: #010102;
  --paper-muted: #0f1011;
  --surface-2: #141516;
  --surface-3: #18191a;
  --accent: #5e6ad2;
  --accent-strong: #828fff;
  --danger: #e03131;
  --line: #23252a;
  --line-strong: #34343a;
  --text: #f7f8f8;
  --muted: #a6adba;
  --radius-sm: 8px;
  --radius-md: 12px;
  --radius-lg: 16px;
  --shadow-card: 0 1px 0 rgb(255 255 255 / 4%) inset;
  --container: 1180px;
  --reading-width: 760px;
  --space-1: 0.5rem;
  --space-2: 1rem;
  --space-3: 1.5rem;
  --space-4: 2rem;
  --space-5: 3rem;
  --space-6: 5rem;

  --navy-950: var(--paper);
  --navy-800: var(--ink-soft);
  --slate-600: var(--muted);
  --slate-300: var(--line);
  --white: #ffffff;
  --gold: var(--accent);
  --gold-soft: rgb(94 106 210 / 22%);
  --blue-soft: var(--paper-muted);
  --max-width: var(--container);
  --radius: var(--radius-md);
  --shadow: var(--shadow-card);
}
```

- [ ] **Step 2: Update light theme override**

Keep the existing theme toggle useful by making `html[data-theme="dark"]` a slightly lifted variant:

```css
html[data-theme="dark"] {
  --paper: #07080a;
  --paper-muted: #111318;
  --surface-2: #171a21;
  --surface-3: #1d212a;
  --text: #f7f8f8;
  --muted: #a6adba;
  --line: #2a2f3a;
  --line-strong: #3a4150;
  --navy-800: #d0d6e0;
  color-scheme: dark;
}
```

## Task 3: Update Shared CSS

**Files:**
- Modify: `assets/css/base.css`
- Modify: `assets/css/components.css`
- Modify: `assets/css/pages.css`

- [ ] **Step 1: Update base.css**

Change body background to flat dark, adjust headings to 600-700 weight, set link hover and focus to lavender, and remove warm radial decoration.

- [ ] **Step 2: Update components.css**

Make navigation rectangular, buttons 8px, cards 8-12px, panels dark, and credentials muted chips.

- [ ] **Step 3: Update pages.css**

Make homepage sections use dark surface hierarchy, reduce large radii, convert contact CTA to charcoal/lavender, and keep mobile layouts stable.

## Task 4: Verify

**Files:**
- Test: `tests/site.test.mjs`

- [ ] **Step 1: Run tests**

Run:

```powershell
npm test
```

Expected: all existing site tests pass.

- [ ] **Step 2: Inspect changed files**

Run:

```powershell
git diff -- DESIGN.md assets/css/tokens.css assets/css/base.css assets/css/components.css assets/css/pages.css
```

Expected: changes are limited to the design document and CSS visual system.

- [ ] **Step 3: Commit implementation**

Run:

```powershell
git add DESIGN.md assets/css/tokens.css assets/css/base.css assets/css/components.css assets/css/pages.css
git commit -m "apply design md visual system"
```

Expected: one implementation commit after tests pass.

