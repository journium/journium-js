# SDK Gaps & Improvements

Issues and improvements identified in the journium-js SDK, prioritized by impact on the analytics pipeline's ability to generate behavioral insights.

---

## Issues (Bugs / Data Gaps)

### 1. No UTM parameter tracking
The SDK captures `$referrer` and `$search` (raw query string) but never extracts UTM parameters (`utm_source`, `utm_medium`, `utm_campaign`, `utm_term`, `utm_content`). The pipeline cannot do attribution analysis without these. The raw query string in `$search` is often empty (e.g., direct visits), and parsing it in the pipeline is fragile.

**Impact:** Blocks attribution analysis entirely.

### 2. No `$pageleave` / session-end event
No event fires on page unload (`beforeunload`, `visibilitychange`). Consequences:
- Session duration is estimated from first-to-last event gap — inaccurate for sessions ending with no interaction
- Bounce sessions (single pageview, user leaves) always show `duration_seconds = 0`
- Time-on-page per page is impossible to calculate

**Impact:** Inaccurate duration and bounce metrics in journeys.

### 3. No scroll depth tracking
No scroll percentage is captured. For content pages (blogs, docs, product pages), scroll depth is a strong engagement signal the pipeline could use for journey quality scoring.

**Impact:** Missing engagement signal for content-heavy pages.

### 4. `$title` doesn't update on SPA navigation
In observed events, both `/` and `/categories/fashion` report the same `$title: "ShopDemo - E-commerce Demo"`. The pageview tracker reads `document.title` at capture time, but SPAs often update the title asynchronously after the route change. The pipeline uses this for page labeling in journeys.

**Impact:** Incorrect page labels in journey sequences.

### 5. `$lib_version` is hardcoded to `'0.1.0'`
Does not reflect the actual package version (`@journium/js@1.2.2`). Makes it impossible for the pipeline to segment or debug by SDK version.

**Impact:** Low — operational/debugging concern.

### 6. No `$pageview_id` / `$window_id`
The Tinybird events schema has columns for these, but the SDK never generates them. A `$pageview_id` linking autocapture events to their parent pageview would let the pipeline compute per-page engagement (clicks per page, time per page).

**Impact:** Cannot correlate clicks/interactions to specific page views.

---

## Improvements (New Signals for Behavioral Insights)

### 7. Add `$session_start` as an explicit event
The pipeline currently infers session boundaries from timestamp gaps. An explicit session start event would carry the referrer/UTM context of the entry point, making attribution cleaner.

### 8. Capture `$screen_width` / `$screen_height` / `$viewport`
The Tinybird schema supports these but the SDK doesn't send them. Useful for responsive design analytics and segmenting mobile vs desktop behavior.

### 9. Form submit should include `$form_id` or `$form_name`
Form submissions capture `$form_action` and `$form_elements_count` but not a stable form identifier. For onboarding funnel tracking (e.g., "completed signup form"), the pipeline needs a way to identify which form was submitted.

### 10. Site search detection
When `$search` query params or `$pathname` contain common search patterns, this could be auto-detected or exposed as a `$site_search` property. Site search is a strong intent signal.

### 11. Add `$copy` autocapture event type
Copy events on pricing pages or product descriptions are purchase-intent signals. The SDK already supports text selection tracking (optional) — copy would be a natural extension.

---

## Code-Level Improvements

### 12. User agent parsing is naive
`browser-identity.ts` uses simple `includes()` string matching. This can misidentify:
- Chrome-based browsers (Edge, Opera, Brave) may match `Chrome` first depending on check order
- `$device_type` detection uses `/Mobi/` regex which misses some tablets

Consider using a lightweight UA parser or at minimum ordering checks correctly (Edge before Chrome, etc.).

### 13. Event queue retry has no bounds
Failed `flush()` calls re-queue events at the front, but there's no max retry count or exponential backoff. On prolonged network issues, the queue grows unbounded in memory.

### 14. `replaceState` triggers `$pageview` — may over-count
Some frameworks use `replaceState` for shallow routing (updating query params without navigation). This fires a `$pageview` that isn't a real page visit, inflating page counts in journeys.

### 15. No event deduplication
If `flush()` partially succeeds (network timeout after server received events), re-queued events are sent again. The pipeline's ReplacingMergeTree handles dedup at storage level, but the ingestion API processes duplicates unnecessarily.
