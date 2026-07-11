# Usability & Growth Review — Quick Wins

**Reviewed:** July 2026
**Branch:** `claude/app-usability-review-gmp5ie`
**Scope:** Full app review focused on quick, easy wins for usability and growth. Findings are ranked by impact ÷ effort with exact file/line references.

> **Status: IMPLEMENTED.** Everything below has been implemented on this branch
> (all Top 10, all Growth/SEO items, all Home UX items, all contribution-funnel
> items, including the week-2 event-page SSR rework). Two variations from the
> original write-up: the modal's related-events buttons were left as buttons
> (the modal is client-only, so crawlability comes from the new SSR event page
> links instead), and `ErrorBoundary` reports production crashes to GA4 rather
> than a new logging endpoint. Line numbers in the findings refer to the
> pre-fix code.

---

## Top 10 Quick Wins (do these first)

Each of these is a small diff with outsized impact.

### 1. Render the built-but-dark `WeeklyEvents` component
- **Where:** `src/components/WeeklyEvents.tsx` (entire component); `src/components/HomeContent.tsx`
- A complete, polished "On This Week" carousel (week label, scroll arrows, mode filtering) exists but is imported nowhere. A finished retention/discovery surface shipping to nobody.
- **Fix:** Import and render `<WeeklyEvents events={combinedEvents} />` in `HomeContent.tsx` near `OnThisDayCard` (line 85).

### 2. Add `robots.ts` (missing entirely)
- **Where:** absent from `src/app/` and `public/`
- No `Sitemap:` directive means the sitemap of 500+ event URLs is undiscoverable to crawlers except via manual Search Console submission. No crawl policy for `/admin` or `/api` either.
- **Fix:** Add `src/app/robots.ts` returning `{ rules: [{ userAgent: '*', allow: '/', disallow: ['/admin/', '/api/'] }], sitemap: 'https://chainofevents.xyz/sitemap.xml' }`.

### 3. Remove `force-dynamic` from the root layout
- **Where:** `src/app/layout.tsx:14` (also `src/app/page.tsx:15`)
- Route-segment config in the root layout cascades to **every** route — all 500 event pages render per-request with zero CDN caching. Higher TTFB on every page hurts bounce rate and Core Web Vitals ranking.
- **Fix:** Delete line 14 of `layout.tsx`. Give `/event/[slug]` `export const revalidate = 3600` (+ `generateStaticParams`). Cache the homepage query (see #4).

### 4. Cache the homepage events query
- **Where:** `src/app/page.tsx:112-119`; `src/lib/events-db.ts:70-122`
- Every homepage hit blocks on a live Supabase `select("*", { count: "exact" })` for 500 rows before any HTML streams. The dataset only changes via daily crons (`vercel.json`), so per-request freshness buys nothing.
- **Fix:** Wrap in `unstable_cache(..., { revalidate: 300 })` or convert the segment to ISR. Also add `src/app/loading.tsx` rendering the existing `<SkeletonTimeline />` so the server wait shows a skeleton instead of a blank page.

### 5. URL-sync the Category & Incident-Type filters (broken deep links)
- **Where:** `src/hooks/useUrlSync.ts:16, 55-59, 161-186`
- The URL syncs `mode`/`q`/`tags`/`sort`/`event` — but **not** `selectedCategories` or `selectedCrimelineTypes`, which are the filters users actually set (`SearchFilter.tsx:491, 580, 652`; CT Lore button `Header.tsx:174`). Shared/bookmarked filtered views silently lose the filter. Inverted irony: `tags` *is* synced but has no home-page UI to set it.
- **Fix:** Add `cat`/`type` params to the read and write blocks, mirroring the existing tags handling. Shareable filtered views are the primary growth loop for a reference site.

### 6. Pre-fill share text on the X/Twitter intent + add native mobile share
- **Where:** `src/components/ShareButton.tsx:69-73` (and 77-80 for Farcaster)
- The tweet intent carries **URL only** — no `text=`, no `via=`. `getFirstSentence()` is computed at line 62 and never used. And there's no `navigator.share` option, so mobile users can't share to iMessage/WhatsApp/etc. — the highest-conversion share surface.
- **Fix:** `&text=${encodeURIComponent(`${event.title} — ${firstSentence}`)}&via=chainofevents`; add a Web Share button behind `if (navigator.share)`. Also update `warpcast.com/~/compose` → `farcaster.xyz/~/compose` (`ShareButton.tsx:78`, `Footer.tsx:61`).

### 7. Stop retrying 4xx errors in the feedback form (~7s stall on typos)
- **Where:** `src/components/FeedbackModal.tsx:211-233`; `src/lib/utils.ts:78-96`
- `withRetry` retries **any** error 3× with backoff (1s+2s+4s), including 400 validation errors and 429 rate limits. A user who mistypes an email watches "Retrying… (Attempt N)" for ~7 seconds for a request that can never succeed.
- **Fix:** Throw a non-retryable error for `response.status < 500`; only retry 5xx/network failures.

### 8. Fix the embed widget: `X-Frame-Options: DENY` blocks it globally
- **Where:** `next.config.ts` headers on `source: "/(.*)"`; `src/app/embed/[id]/page.tsx`
- The embeddable event widget can **never be iframed anywhere** — the global DENY header applies to `/embed/*` too. The feature is dead on arrival. It's also undiscoverable (no "Embed" option in `ShareButton`).
- **Fix:** Exclude `/embed` from the DENY matcher (e.g. `source: "/((?!embed).*)"`) and give `/embed/:path*` `Content-Security-Policy: frame-ancestors *`. Then add an "Embed" action to `ShareButton` that copies an `<iframe>` snippet — embeds seed backlinks from crypto blogs/newsletters.

### 9. Re-enable pinch zoom
- **Where:** `src/app/layout.tsx:19-20` — `maximumScale: 1, userScalable: false`
- Blocks pinch-zoom; a straight accessibility failure flagged by Lighthouse. `globals.css:45` already has `touch-action: pan-x pan-y` to prevent accidental zoom.
- **Fix:** Remove `maximumScale` and `userScalable` from the viewport export.

### 10. Load Inter via `next/font` instead of render-blocking CSS `@import`
- **Where:** `src/app/globals.css:1`
- The `@import` creates a request chain (CSS → Google CSS → font file) on the critical path of every page, and pulls the entire 100–900 weight axis when only ~4 weights are used. No `next/font` anywhere.
- **Fix:** Replace with `next/font/google` `Inter` in `layout.tsx` (self-hosted, auto-preloaded); drop the two Google Fonts preconnects. Also drop the eager Twitter preconnects (`layout.tsx:123-124`) — `TwitterEmbed.preloadTwitterScript()` already warms them on demand.

---

## Growth / SEO (beyond the top 10)

### G1. Event pages redirect real users away and serve bots thin content
- **Where:** `src/app/event/[slug]/page.tsx:129-145`
- Humans hitting `/event/slug` get 307-redirected to `/?event=id`; bots get a bare `<h1>` + summary + one link. This is borderline cloaking, gives the ranking URL a redirect signature, and means search/social visitors never land on exact content. This is the biggest *structural* SEO issue — slightly more than a "quick" win, but the highest-value medium task on the list.
- **Fix:** Server-render the real event content at `/event/slug` for everyone (detail view inline, with a link back into the timeline), instead of redirecting.

### G2. `/?event=<id>` modal URLs have no canonical pointing at the slug page
- **Where:** `src/app/page.tsx:21-102` — the event branch of `generateMetadata` sets OG url to `/event/slug` but never sets `alternates.canonical`.
- Two live URLs per event with no consolidation signal → duplicate-content dilution.
- **Fix:** Add `alternates: { canonical: `/event/${slug}` }` in the event branch.

### G3. No JSON-LD structured data anywhere
- **Where:** `src/app/event/[slug]/page.tsx`, `src/app/layout.tsx`
- **Fix:** Inject `<script type="application/ld+json">` — `NewsArticle` (headline, datePublished = event.date, image = ogImageUrl) on event pages; `WebSite` + `SearchAction` on home. Rich-results/Discover eligibility for a history site is a natural fit.

### G4. No internal link graph between events
- **Where:** `src/components/EventDetailModal.tsx:619-621` (related events are `<button onClick>`); bot page links only to `/?event=id` (`event/[slug]/page.tsx:139`)
- Bots can't traverse the event graph; PageRank doesn't flow between 500 pages.
- **Fix:** Render related events as real `<a href="/event/slug">` (progressively enhanced to open the modal); fix the bot page link to use the canonical slug already computed at line 33.

### G5. Sitemap polish
- **Where:** `src/app/sitemap.ts:10-18`
- Hard 500-event cap (silent truncation as the dataset grows) and `lastModified: new Date()` on every URL every crawl (noisy freshness signal).
- **Fix:** Use `event.updated_at ?? event.date` for lastModified; paginate past 500.

### G6. RSS feed exists but is advertised nowhere
- **Where:** `src/app/api/feed/route.ts` (fully built RSS + Atom); no `alternates.types` in layout metadata, no footer link.
- **Fix:** Add `alternates: { types: { 'application/rss+xml': '/api/feed' } }` to layout metadata and an RSS link in `Footer.tsx`.

### G7. PWA manifest icons are non-square
- **Where:** `public/manifest.json:9-21` — both icons declared `1088x960`; one marked `maskable`.
- Installability criteria want square 192×192 and 512×512; maskable non-square icons get cropped.
- **Fix:** Generate proper square icons (separate maskable asset).

### G8. OG card polish
- `src/app/api/og/route.tsx:50` and `src/app/api/twitter/route.tsx:50` compute `getFirstSentence(summary)` but never render it — cards show only title+date. The two routes are byte-identical; dedupe and render the summary line.
- "Share as image" (`ShareButton.tsx:82-86`) omits the `image`/`summary` params, so the previewed card differs from what actually gets shared.
- Event-page twitter metadata omits `site`/`creator` attribution (`event/[slug]/page.tsx:76-88`); layout has it.
- `src/components/SocialSharePreview.tsx` (the nicer card design) is only used by `test-preview` — port its layout into `/api/og` or delete it.

---

## Home-page UX

### U1. Crimeline toggle unreachable mid-scroll on mobile
- **Where:** header hides on scroll-down (`Header.tsx:88-94`); `StickyFilterButton.tsx:55-113` only exposes Filter + Sort
- The mode toggle — the app's signature feature — lives only in the header, which slides away. No way to switch modes without scrolling to the top.
- **Fix:** Add a compact mode switch to the sticky mobile bar, or a back-to-top affordance.

### U2. Search fires on every keystroke
- **Where:** `src/components/SearchFilter.tsx:344`
- Each character re-runs filtering/grouping/virtualization **and** a `router.replace` URL write. Laggy typing on mobile.
- **Fix:** Local input state + ~200ms debounce before `setSearchQuery`.

### U3. Dead code: `ActiveFiltersRow.tsx`
- **Where:** `src/components/ActiveFiltersRow.tsx` (236 lines, imported nowhere), with the ZachXBT/Cobie/Twitter SVGs duplicated again in `SearchFilter.tsx:29-179` and `CategoryPills.tsx:13-53`.
- **Fix:** Delete the file; extract the shared icons into one module.

### U4. Small polish items
- Empty label above the premium filter pills — blank `<div>` where "Creators & Lore" should be (`SearchFilter.tsx:463-468`).
- Empty `MobileYearSelector` bar still renders when filters yield zero results (`MobileYearSelector.tsx:26-37`) — add `if (years.length === 0) return null`.
- Hero "Explore" scroll lands under the fixed header (`HeroSection.tsx:53-55`) — add `scroll-mt` to `#timeline-section`.
- Sort control is icon-only below `sm` (`SearchFilter.tsx:397`) — keep a short visible label.
- Onboarding tooltip describes two modes but there are three, and its arrow is absolutely positioned at `top-28` which drifts across breakpoints (`OnboardingTooltip.tsx:42-55`).
- `ModeToggle` uses `role="radiogroup"` without arrow-key roving focus, and the visible "All" label is announced as "Both modes active" (`ModeToggle.tsx:22-77`) — switch to `role="group"` + `aria-pressed`, align copy.

---

## Contribution funnel

### C1. Email required for all feedback types
- **Where:** `src/components/feedback/ContactFields.tsx:26-34`; `src/lib/validation.ts:118`
- Requiring an email to report a bug or suggest an event is the classic funnel killer, and it's the first field shown.
- **Fix:** Make email optional for `type === "general"` (client + Zod).

### C2. Exact date required blocks historical submissions
- **Where:** `src/components/feedback/EventFields.tsx:69-76`; `FeedbackModal.tsx:484-491`
- Native `type="date"` forces an exact day; much of crypto history is "2011" or "mid-2013". Valid submissions are impossible.
- **Fix:** Accept `YYYY`, `YYYY-MM`, or `YYYY-MM-DD` (pattern-validated text) or an "approximate date" affordance.

### C3. Success state sets false expectations
- **Where:** `src/components/feedback/SuccessAnimation.tsx:85-97`
- Submissions go to a moderation queue, but the copy says only "Submitted Successfully!". When the event doesn't appear, contributors assume failure and don't come back.
- **Fix:** One line: "We'll review it and add it to the timeline soon."

### C4. Smaller funnel fixes
- Re-opening "Suggest Edit" for the same event shows blank fields — prefill effect doesn't re-fire after `resetForm()` (`FeedbackModal.tsx:69-98, 125-155`); gate prefill on `isOpen`.
- `funds_lost` accepts free text ("$100M") that breaks the crimeline stats math (`CrimelineFields.tsx:74-81`) — use numeric input + hint.
- `RandomEventButton` no-ops silently when the mode has no events (`RandomEventButton.tsx:26`) — disable or hint.
- "On This Day" can render "0 years ago" (`OnThisDayCard.tsx:41, 183-184`) — show "This year".
- No live character counters despite server-enforced max lengths (`EventFields.tsx:84-92`; `validation.ts:123, 138-139`).
- Feedback error banner is hardcoded light-mode colors in the dark Crimeline theme (`FeedbackModal.tsx:550`).
- `ErrorBoundary` reports nothing in production (`ErrorBoundary.tsx:30-38`) — wire `onError` to a logging endpoint so real crashes are visible.

---

## What's already good (don't touch)

- **Timeline virtualization** with measured group heights works correctly (`Timeline.tsx:169-408, 555-599`).
- **Images:** consistently `next/image` with priority hints, blur placeholders, AVIF/WebP.
- **API caching:** `api/v1/*` routes already set CDN cache headers; OG images cached 24h with SWR.
- **Accessibility basics are strong:** reduced-motion respected everywhere, good ARIA on pills/toggles/modals, focus management + Escape + scroll-lock in modals, keyboard-operable event cards.
- **Deep-linking that exists** (mode/search/sort/`?event=`) works, including modal deep links.
- **Feedback entry points** are well-distributed (header, hero, footer ×2, contextual "Suggest Edit").
- **Server-side defense in depth** on the feedback API: Zod + sanitization + rate limiting.
- **Slug lookup** (`getEventBySlug`) is robust and round-trips sitemap slugs correctly.
- Rotating search placeholders, haptics, the empty-state CTA, and `SuccessAnimation` are genuinely nice touches.

---

## Suggested shipping order

**Day 1 (one small PR each, near-zero risk):**
robots.ts (#2) → render WeeklyEvents (#1) → pinch zoom (#9) → share text + Web Share (#6) → success copy (C3) → RSS discovery (G6) → dead code removal (U3).

**Day 2 (small but needs a quick smoke test):**
Remove `force-dynamic` + cache homepage query + `loading.tsx` (#3/#4) → `next/font` (#10) → URL-sync categories (#5) → feedback retry fix (#7) → search debounce (U2) → embed frame headers + Embed button (#8).

**Week 2 (the one structural item worth scheduling):**
Make `/event/[slug]` a real SSR page for everyone with JSON-LD and crawlable related-event links (G1/G3/G4) — this converts 500 pieces of content into an actual organic-search asset.
