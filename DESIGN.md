---
name: Budgerr App
description: The personal budget client that treats a bet like any other line item.
colors:
  accent: "#873273"
  accent-pressed: "#70125d"
  ink: "#000000"
  ink-secondary: "#666666"
  ink-muted: "#6c6c6c"
  surface: "#ffffff"
  surface-card: "#f5f5f5"
  hairline: "#e2e2e2"
  success: "#1d9e75"
  success-bg: "#e1f5ee"
  warning: "#ba7517"
  warning-bg: "#faeeda"
  danger: "#a32d2d"
  danger-bg: "#fcebeb"
  edge: "#00794d"
  edge-bg: "#00794d22"
typography:
  header:
    fontFamily: "System (San Francisco on iOS)"
    fontSize: "22px"
    fontWeight: 500
    lineHeight: 1.2
  title:
    fontFamily: "System"
    fontSize: "14px"
    fontWeight: 500
    lineHeight: 1.3
  amount:
    fontFamily: "System"
    fontSize: "20px"
    fontWeight: 500
    lineHeight: 1.2
  body:
    fontFamily: "System"
    fontSize: "13px"
    fontWeight: 400
    lineHeight: 1.4
  label:
    fontFamily: "System"
    fontSize: "12px"
    fontWeight: 500
    lineHeight: 1.3
rounded:
  card: "12px"
  tile: "8px"
  badge: "6px"
  track: "4px"
spacing:
  xs: "4px"
  sm: "8px"
  md: "12px"
  lg: "16px"
components:
  card-default:
    backgroundColor: "{colors.surface-card}"
    rounded: "{rounded.card}"
    padding: "16px"
  tile-default:
    backgroundColor: "{colors.surface-card}"
    rounded: "{rounded.tile}"
    padding: "16px"
  badge-ok:
    backgroundColor: "{colors.success-bg}"
    textColor: "{colors.success}"
    rounded: "{rounded.badge}"
    padding: "3px 8px"
  badge-warning:
    backgroundColor: "{colors.warning-bg}"
    textColor: "{colors.warning}"
    rounded: "{rounded.badge}"
    padding: "3px 8px"
  badge-danger:
    backgroundColor: "{colors.danger-bg}"
    textColor: "{colors.danger}"
    rounded: "{rounded.badge}"
    padding: "3px 8px"
  log-bet-button:
    backgroundColor: "transparent"
    textColor: "{colors.ink}"
    rounded: "{rounded.tile}"
    padding: "6px 12px"
  submit-button:
    backgroundColor: "{colors.accent}"
    textColor: "{colors.surface}"
    rounded: "{rounded.tile}"
    padding: "14px"
---

# Design System: Budgerr App

## 1. Overview

**Creative North Star: "The Quiet Ledger"**

Budgerr App reads like a plainspoken accounting notebook, not a fintech dashboard. Every number — grocery spend, bank cash flow, a bet's stake — gets the same flat card, the same 500-weight amount, the same hairline border. There is no separate "fun" visual register for the betting category; the Quiet Ledger doesn't celebrate a parlay any louder than it reports a grocery bill, because the whole point of this app is that a bet is just another line, not a special event.

The system rejects the two things it's easiest to drift toward: generic navy-and-teal SaaS-finance chrome (stacked gradient-metric cards, hero KPI tiles), and sportsbook/casino energy (neon odds badges, celebratory color). A muted plum accent (`#873273`) replaces the unmodified Expo-template blue this system launched with — plum reads as a personal, warm choice rather than corporate-trustworthy blue, and its hue sits far enough from the success/warning/danger set that it can never be mistaken for a status color. Card Rest, the system's one ambient shadow, has landed on the Tonight tab's cards (`GameCard`, `ParlayCard`) as the first application of the "tactile and confident" direction; the four budget-tab cards still need the same treatment (see Elevation) to avoid a Tonight-vs-Budget inconsistency.

**Key Characteristics:**
- Flat, hairline-bordered cards as the one repeating container — no card-inside-card nesting anywhere in the codebase today
- A single three-way status vocabulary (success/warning/danger) reused identically across budget bars, bet outcomes, and category badges
- System font only, small type scale (11–22px), weight doing the hierarchy work instead of size jumps
- Restrained color: one deliberate plum accent for actions/selection/emphasis, plus the semantic success/warning/danger set — nothing decorative

## 2. Colors

Nearly monochrome by design — ink, hairline gray, and card-gray carry the whole UI, with color reserved for the three status meanings and a single accent.

### Primary
- **Quiet Plum** (#873273 light / #d983c1 dark, `oklch(46% 0.14 338)` / `oklch(72% 0.13 338)`): The one accent color — active tab, links, the "+ Log a bet" header icon's press affinity, selected bet-type chip, the "Log bet" submit button fill, and odds/multiplier callouts. Used for primary action, current selection, and interactive emphasis only, never as decoration. Both light and dark values clear 7.5:1 against their respective button-fill text.
- **Quiet Plum, Pressed** (#70125d light / #e6a9d6 dark): One step darker/lighter for pressed states on filled controls (the "Log bet" submit button, selected bet-type chip).

### Neutral
- **Ledger Ink** (#000000 light / #ffffff dark): Primary text.
- **Ledger Ink, Secondary** (#666666 light / #aaaaaa dark): Supporting copy — sub-amounts, category labels, "of $X spent" text.
- **Ledger Ink, Muted** (#6c6c6c light / #888888 dark): Least-emphasis text — empty states, timestamps, placeholders. Darkened/lightened from the original #999999/#777777, which failed WCAG AA (as low as 2.61:1 on card backgrounds) — both new values clear 4.5:1 against the screen background and the card background.
- **Ledger Paper** (#ffffff light / #000000 dark): Screen background.
- **Ledger Card** (#f5f5f5 light / #1c1c1e dark): Every card and tile background — the one surface color besides the page itself.
- **Hairline** (#e2e2e2 light / #2c2c2e dark): The single border weight used everywhere (0.5px), and the progress-track background.

### Semantic status (used identically for budget %, bet outcome, and category state)
- **Ledger Green** (#1d9e75 on #e1f5ee bg light / #5dcaa5 on #085041 bg dark): On track, bet won, under 80% of limit.
- **Ledger Amber** (#ba7517 on #faeeda bg light / #f2a13f on #633806 bg dark): Approaching limit (≥80%).
- **Ledger Red** (#a32d2d on #fcebeb bg light / #f09595 on #791f1f bg dark): Over limit, bet lost.

### Edge (playstat positive-edge indicator)
- **Ledger Edge Green** (#00794d on #00794d1a-tint bg light / #34d399 dark): Marks a playstat pick as a positive-edge leg in `GameCard` and `ParlayCard` — a distinct hue from `success` so "this leg has an edge" never reads as "this bet already won." Darkened from the `#059669` these components used to hardcode inline, which only cleared 3.46:1 against the card background; `#00794d` clears 5:1.

### Named Rules
**The One Ledger Rule.** A dollar amount, a percentage, and a bet outcome share the same three status colors and the same type scale. Never introduce a fourth color or a bigger number treatment just because the row happens to be about betting.

**The One Accent Rule.** Quiet Plum is the only non-semantic color in the system. If a new component wants "brand personality," reach for plum at low dosage (an icon tint, a selected state), never a second accent hue.

## 3. Typography

**Display Font:** System (San Francisco on iOS, Roboto on Android, system-ui on web)
**Body Font:** System (same stack)
**Label/Mono Font:** SpaceMono (`components/StyledText.tsx`'s `MonoText`) — defined but not currently used on any screen.

**Character:** Entirely unstyled type — no custom font has been chosen yet. Hierarchy comes from a narrow size range (11–22px) and two weights (400/500), which is exactly the restraint the Quiet Ledger calls for; this is one area where "unstyled" and "on-brand" currently agree.

### Hierarchy
- **Header** (500, 22px, 1.2 line-height): Screen title only ("Budget"). One per screen.
- **Title** (500, 14px, 1.3): Card headings ("Recent bets", "Best card for [category] right now", game matchups, parlay summaries).
- **Amount** (500, 20–22px): The hero number in any card — spent amount, net profit, category total. The only place size jumps above 14px inside a card.
- **Body** (400, 13px, 1.4): Supporting sentences, sub-amounts, "of $X spent" strings, row titles in Recent Bets.
- **Label** (500, 11–12px, no letter-spacing): Badges, status pills, edge/leg detail rows. The smallest type in the system; always paired with a background tint (success-bg / warning-bg / danger-bg), never color-alone.

### Named Rules
**The Weight-Not-Size Rule.** Emphasis is 400→500 weight, not a bigger font. Nothing on any screen jumps more than ~8px between adjacent hierarchy levels.

## 4. Elevation

**Partially rolled out.** `GameCard` and `ParlayCard` (Tonight tab) now carry Card Rest via the shared `cardShadow` constant in `constants/Shadow.ts`. `BudgetPeriodCard`, `RecentBets`, `BestCardTip`, `CategoryTile`/`TrendStats` tiles, and the accounts-nudge banner are still flat — solid `surface-card` fill, 0.5px hairline border, zero shadow. Apply the same `cardShadow` import to those components next; importing the shared constant rather than re-declaring the shadow values is what keeps this a system instead of six independent choices.

### Shadow Vocabulary
- **Card Rest** (`constants/Shadow.ts` → `cardShadow`: `boxShadow: '0px 2px 8px rgba(0,0,0,0.06)'` plus Android `elevation:2`): The only shadow in the system. Uses RN's unified `boxShadow` string rather than the deprecated discrete `shadow*` props. Applies to every card-shaped component at rest, replacing nothing else — the hairline border stays.

### Named Rules
**The One Shadow Rule.** There is exactly one shadow in this system, used identically on every card. If a component needs to feel "more important," raise its type weight or add a status color, not a heavier shadow.

## 5. Components

Tactile and confident is the target feel: firm 500-weight labels, filled status badges (never outline-only), and a soft lift under every card. Nothing here is loud; "confident" means legible and settled, not saturated.

### Cards / Containers
- **Corner Style:** 12px radius (`rounded.card`) for primary cards (budget period, recent bets, best-card tip, game card, parlay card); 8px (`rounded.tile`) for the smaller side-by-side tiles (category tile, trend-stat tile).
- **Background:** `surface-card` (#f5f5f5 / #1c1c1e), flat fill, no gradient.
- **Border:** 0.5px hairline (`colors.hairline`) on primary cards; tiles currently have no border.
- **Shadow Strategy:** Card Rest (see Elevation), imported from `constants/Shadow.ts` — live on the two tonight-tab cards, pending on the budget-tab cards. Don't stack a second shadow on top of the hairline border.
- **Internal Padding:** 16px on primary cards, 14px on the compact tonight-tab cards (game/parlay).

### Badges / Status Pills
- **Style:** Filled background using the semantic bg token (success-bg/warning-bg/danger-bg), text in the matching foreground token, 6px radius, 3px/8px vertical/horizontal padding, 11–12px label text.
- **State:** No interactive states — badges are read-only status, never tappable.

### Buttons
- **Shape:** 8px radius (`rounded.tile`).
- **"+ Log a bet" trigger (Recent Bets card header):** Outline button — transparent background, hairline border, ink text, 13px. Deliberately quiet since it's a secondary entry point into the modal; the modal's own submit is where the accent commits.
- **"Log bet" submit (modal):** Filled — `accent` background, white/black (`surface`) text, 500 weight, 14px padding. The one filled, full-commitment button in the system.
- **Selected bet-type chip (modal):** Filled `accent` background with `surface`-colored text when selected; ink text on transparent otherwise.
- **Header "+" icon:** SF Symbol (`plus.circle`) at full opacity, 0.5 opacity when pressed — the system's only press-state treatment anywhere besides the accent-pressed color step.

### Progress Track (Budget Period Card)
- **Style:** 6px-tall track in `hairline` color, 4px-radius fill in the matching status color, width driven by spend percentage.
- **Thresholds:** ok <80%, warning 80–99%, danger ≥100% — matches the backend's own alert thresholds; don't invent a fourth threshold in the UI without a backend change.

### Navigation
- **Style:** Native iOS tab bar (`expo-router` `Tabs`), four tabs — Budget, Tonight, Accounts, Transactions — each with an SF Symbol icon, active tint from `colors.accent` (Quiet Plum). Header title is native, with a single trailing "+" icon on the Budget tab only.

## 6. Do's and Don'ts

### Do:
- **Do** keep every dollar amount, percentage, and bet outcome inside the same three-color status vocabulary (`success`/`warning`/`danger`) — one meaning, one set of colors, everywhere.
- **Do** route any new semantic color through `constants/Colors.ts`, light and dark variants both, before using it in a component.
- **Do** reserve `accent` (Quiet Plum) for primary action, current selection, and interactive emphasis — never decoration, never a second brand color alongside it.
- **Do** keep type hierarchy to weight changes (400/500) within the existing 11–22px range rather than introducing a larger display size.
- **Do** apply the single Card Rest shadow via the shared `cardShadow` import from `constants/Shadow.ts` — no per-component shadow tuning, no redeclaring the values inline.
- **Do** pair every status color with a label or icon, never color alone, per PRODUCT.md's accessibility requirement.

### Don't:
- **Don't** introduce a navy-and-teal or gradient-metric "generic fintech" look — no gradient fills, no stacked hero-KPI cards, no Mint/Copilot-style dashboard chrome (PRODUCT.md anti-reference).
- **Don't** give the betting category louder, brighter, or more celebratory styling than any other budget category — no neon badges, no sportsbook-style odds chips, no confetti (PRODUCT.md anti-reference).
- **Don't** hardcode a new color directly in a component's `StyleSheet` — route it through `constants/Colors.ts` first, the way `edge`/`edgeBg`/`edgeBorder` now replace the emerald `ParlayCard`/`GameCard` used to hardcode.
- **Don't** reach for blue as a second accent, or as a fallback if plum ever feels "too bold" — blue is the generic-fintech default this system explicitly moved away from.
- **Don't** stack more than one shadow value on a card, or add a shadow to a badge/pill — Card Rest is a card-only treatment.
