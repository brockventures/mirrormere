---
name: Modern UI/UX Design Standards & Software Design System Reference
description: "Universal operational reference for modern software UI/UX, interaction design, component ergonomics, typography, color systems, and visual hierarchy across all web applications and dashboards"
category: reference
source: reference_ui_ux_design_standards.md
updated: 2026-09-19
---

# Universal Modern UI/UX Design Standards & Design System Reference

*Definitive engineering guidelines for designing, building, and refactoring user interfaces, web applications, tools, and dashboards.*

---

## 1. Information Architecture & Progressive Disclosure

### The 80/20 Progressive Disclosure Rule
- **Primary Surface (Level 1):** Surface the 20% of controls and data that solve 80% of everyday user tasks upfront. Keep the main view uncluttered, focused, and immediately actionable.
- **Secondary Detail (Level 2):** Tuck secondary configurations, multi-split statistics, historical time-series, or raw parameters behind **Slide-Over Drawers (Sheets)**, contextual accordions, or drilldown tabs.
- **Context Preservation:** Never replace the entire screen or force full-page reloads for localized inspections. When selecting an item, slide a right-side panel over the viewport so the user maintains visual context and scroll position.

### Spatial Rhythm & The 4px/8px Geometric Grid
- All layout dimensions, margins, paddings, and gaps MUST strictly adhere to a consistent 4px/8px scale:
  - `4px` (`p-1`, `gap-1`), `8px` (`p-2`, `gap-2`), `12px` (`p-3`, `gap-3`), `16px` (`p-4`, `gap-4`), `24px` (`p-6`, `gap-6`), `32px` (`p-8`, `gap-8`).
- Never use arbitrary ad-hoc pixel values (e.g. `margin-top: 13px`, `padding: 7px 11px`).
- Hierarchy of padding: Outer container `p-6` (24px) -> Card container `p-4` or `p-5` (16-20px) -> Inner controls / list items `py-2 px-3` (8px / 12px).

---

## 2. Typography, Content Layout & Data Alignment

### Header-Aligned Data & Contextual Alignment
- **Header-Matching Alignment:** Cell data alignment should match its column header alignment to create clean vertical sightlines.
  - **Left-Aligned by Default:** Text strings, labels, names, descriptions, and general mixed data tables align to the left.
  - **Centered for Fixed Codes & Badges:** Short fixed-width tokens (status badges, abbreviations, 2-letter codes, icon markers) should be centered.
  - **Right-Aligned for Comparative Financials:** Right-alignment is reserved for financial balance sheets, ledgers, or currency stacks where decimal points must align vertically for manual arithmetic scanning.
- **Tabular Figures for Dynamic Metrics:** Use tabular lining figures (`font-variant-numeric: tabular-nums` or `tabular-nums` / `font-mono`) for live metrics, timers, clocks, and rapidly updating values to prevent visual horizontal jitter.

### Typographic Hierarchy & Scale
- **Display / Page Header:** `text-xl` to `text-2xl` (20-24px), `font-bold` or `font-semibold`, subtle letter spacing (`tracking-tight`).
- **Section / Card Header:** `text-base` (16px), `font-semibold` / `font-medium`, strong foreground color.
- **Body / Content:** `text-sm` (13-14px), `font-normal` (400) or `font-medium` (500), line height `leading-relaxed`.
- **Captions & Metadata:** `text-xs` (11-12px), `font-medium`, muted text color (`text-slate-400` / `text-zinc-500`).

---

## 3. Color Discipline & Semantic Surface Tokens

### The 90/10 Neutral Restraint Rule
- **90% Neutral Canvas:** The vast majority of the interface must be built from a cohesive neutral gray/slate/zinc palette:
  - **Dark Mode:** Deep canvas `bg-slate-950` (#020617) -> Card container `bg-slate-900` (#0f172a) -> Interactive hover/dropdown `bg-slate-800` (#1e293b) -> Subtle structural borders `border-slate-800` (#1e293b).
  - **Light Mode:** Canvas `bg-slate-50` (#f8fafc) -> Card container `bg-white` (#ffffff) -> Interactive hover `bg-slate-100` (#f1f5f9) -> Subtle borders `border-slate-200` (#e2e8f0).
- **10% Purposeful Accent:** Color is strictly reserved for user interaction and explicit status indicators:
  - **Primary Interactive:** Royal Blue / Indigo (`bg-indigo-600 hover:bg-indigo-500 text-white`).
  - **Success / Positive:** Emerald / Green (`text-emerald-400 bg-emerald-500/10 border border-emerald-500/20`).
  - **Warning / Attention:** Amber / Orange (`text-amber-400 bg-amber-500/10 border border-amber-500/20`).
  - **Danger / Destructive:** Rose / Red (`text-rose-400 bg-rose-500/10 border border-rose-500/20`).
- **Muted Badge Aesthetics:** Never use raw, solid neon background blocks for status tags. Use soft, tinted backgrounds (10-15% opacity) with matching border accents and high-contrast text.

---

## 4. Control Ergonomics, Forms & Action Hierarchy

### Button Hierarchy (Single Primary Action)
- Every screen, toolbar, or dialog must feature **exactly ONE solid Primary Action button** (`bg-indigo-600 text-white shadow-sm hover:bg-indigo-500`).
- Supporting actions MUST use Secondary styling (`bg-slate-800 border border-slate-700 text-slate-200 hover:bg-slate-700`) or Ghost styling (`text-slate-400 hover:text-slate-100 hover:bg-slate-800/50`).
- Destructive actions (Delete, Reset, Purge) must be visually isolated (`text-rose-400 hover:bg-rose-500/10 border border-rose-500/20`) and require explicit user confirmation.

### Form Inputs & Interactive States
- Inputs should have clean, dark-mode friendly surfaces: `bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-100 placeholder-slate-500`.
- Always provide accessible focus rings (`focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500`).
- Display clear inline validation messages adjacent to the input rather than generic top alert banners.

---

## 5. Performance, Feedback & Zero Layout Shift (CLS = 0)

- **Skeleton Loaders Over Blank Spinners:** When fetching async data, render muted skeleton placeholder blocks matching the exact dimensions of incoming cards, tables, or charts. Never let layout heights collapse to zero.
- **Optimistic UI Updates:** When toggling switches, filters, checkboxes, or submitting small edits, update the local UI immediately (0ms) and reconcile in the background.
- **Intentional Empty States:** When a filter or search produces zero results, provide a clear illustration/icon, a descriptive explanation (*"No items match your active filters"*), and a single primary button to **Reset Filters**.
- **Smooth Micro-Transitions:** Apply subtle transitions on hover and state toggles (`transition-colors duration-150 ease-in-out`). Avoid jarring, instant pops or sluggish, over-animated transitions.
