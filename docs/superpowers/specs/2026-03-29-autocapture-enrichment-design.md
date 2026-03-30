# Autocapture Event Enrichment Design

## Context

Real-world Journium SDK deployments rely on `$pageview` and `$autocapture` events as primary data sources. An analytics pipeline uses the client's analysis config to derive meaningful user actions from these raw events, combining deterministic rules and LLMs.

Current gaps in autocapture event payloads limit the pipeline's ability to derive context:
- `data-*` attributes on elements are silently dropped (hardcoded allowlist only captures `data-testid` and `data-track`)
- No `$element_href` as a first-class property for links (buried in `$elements_chain_href`)
- No `$page_title` on autocapture events (only on `$pageview`)
- CSS module class names (e.g., `Home-module__6mYgAq__button`) are noise for pattern matching
- The sample analysis config references a non-existent "LearnLoop" app instead of the actual nextjs-sample

## Scope

Enrich existing `$autocapture` events with additional properties. No new event types. No changes to `$pageview` events. Rewrite the sample analysis config to match the actual nextjs-sample app.

---

## Files to Modify

| File | Change |
|---|---|
| `packages/core/src/types.ts` | Add `dataAttributePrefixes` and `dataAttributeNames` to `AutocaptureOptions` |
| `packages/journium-js/src/AutocaptureTracker.ts` | Add 4 property improvements to `getElementProperties()` |
| `examples/nextjs-sample/docs/journium-sample-analysis-config.json` | Rewrite to match actual nextjs-sample app |
| `packages/journium-js/src/__tests__/autocapture-properties.test.ts` | New tests for the added properties |

---

## Design

### 1. Type Changes — `packages/core/src/types.ts`

Add two fields to `AutocaptureOptions`:

```typescript
export interface AutocaptureOptions {
  captureClicks?: boolean;
  captureFormSubmits?: boolean;
  captureFormChanges?: boolean;
  captureTextSelection?: boolean;
  ignoreClasses?: string[];
  ignoreElements?: string[];
  captureContentText?: boolean;
  dataAttributePrefixes?: string[];  // prefixes for data-* attrs to capture (default: ['jrnm-'])
  dataAttributeNames?: string[];     // exact data-* attr names to capture (default: ['data-testid', 'data-track'])
}
```

- `dataAttributePrefixes`: captures any `data-{prefix}*` attribute. E.g., prefix `'jrnm-'` captures `data-jrnm-product-id`.
- `dataAttributeNames`: captures exact attribute names. E.g., `'data-testid'`.
- Both are additive. Max 10 data attributes per element.
- Property naming: `data-jrnm-product-id` becomes `$attr_data_jrnm_product_id` (hyphens to underscores, `$attr_` prefix).

### 2. AutocaptureTracker Changes — `packages/journium-js/src/AutocaptureTracker.ts`

Four additions inside `getElementProperties()`:

#### 2a: `$element_href` for links

After element identifiers section:
```typescript
if (element.tagName.toLowerCase() === 'a') {
  const href = element.getAttribute('href');
  if (href) properties.$element_href = href;
}
```

#### 2b: `$page_title` on all autocapture events

In the URL information section (after `$pathname`):
```typescript
properties.$page_title = document.title;
```

Uses `$page_title` (not `$title`) to avoid ambiguity with `$element_text`.

#### 2c: `$element_semantic_classes`

New private method `extractSemanticClasses(classList: DOMTokenList): string[]`:
- Split each class on `__`
- If 3+ parts (CSS module pattern `Module__hash__name`): take the last segment as the semantic name
- If exactly 2 parts (e.g., `Module__hash`): drop it (no semantic name extractable)
- If 1 part (no `__`): keep as-is if it contains at least one letter (filters out pure hash strings like `6mYgAq`)
- A "hash-like" string is defined as: alphanumeric, 5-10 chars, contains both letters and digits (e.g., `6mYgAq`, `a1b2c3`)
- Deduplicate the result
- `$element_classes` remains unchanged for backward compatibility

#### 2d: Configurable `data-*` attribute capture

After the existing `relevantAttributes` loop, iterate `element.attributes`:
- For each attribute starting with `data-`:
  - **Prefix matching**: strip the `data-` prefix, then check if the remainder starts with any entry in `dataAttributePrefixes`. E.g., attribute `data-jrnm-product-id` → remainder `jrnm-product-id` → matches prefix `jrnm-`.
  - **Name matching**: compare the full attribute name (including `data-`) against `dataAttributeNames`. E.g., `data-testid` matches `dataAttributeNames: ['data-testid']`.
  - If either matches, capture it.
- Skip attributes whose **attribute name** appears in the existing `relevantAttributes` array (`['name', 'role', 'aria-label', 'data-testid', 'data-track']`). This prevents duplicate capture under different property names. Note: the existing code stores these as `$element_data_testid` via a single `replace('-', '_')` call. The new code stores via `$attr_` prefix with global hyphen replacement. Since the attribute names overlap, skip them in the new loop.
- Cap at 10 matched attributes per element (first 10 in DOM attribute order; excess silently dropped)
- Store as `$attr_{name_with_all_hyphens_replaced_by_underscores}`. E.g., `data-jrnm-product-id` → `$attr_data_jrnm_product_id`.

Defaults set in constructor when resolving options:
- `dataAttributePrefixes: ['jrnm-']`
- `dataAttributeNames: ['data-testid', 'data-track']`

### 3. Analysis Config Rewrite

Rewrite `examples/nextjs-sample/docs/journium-sample-analysis-config.json` to match actual app.

**event_definitions** — replace with definitions for actual pages/interactions:
- Pageviews: `home_viewed`, `products_viewed`, `about_viewed`
- Product page: `product_added_to_cart`, `product_purchased`
- Home demo: `custom_event_tracked`, `add_to_cart_home`, `feature_usage_tracked`, `file_download_tracked`
- About page: `contact_form_submitted`, `documentation_accessed`, `social_link_clicked`
- Header: `login_initiated`, `signup_initiated`
- Navigation: `navigation_to_products`, `navigation_to_about`

**features.taxonomy** — replace with:
- `product_browsing` (core): products_viewed, product_added_to_cart, product_purchased
- `event_tracking_demo` (core): custom_event_tracked, add_to_cart_home, feature_usage_tracked, file_download_tracked
- `engagement`: documentation_accessed, social_link_clicked, contact_form_submitted
- `authentication` (core): login_initiated, signup_initiated
- `navigation`: all pageview + nav events

**semantic_labeling.page_patterns** — 3 entries: `/` -> home, `/products` -> product_catalog, `/about` -> about

**Remaining sections** (funnels, segments, monitoring, objectives) — write minimal placeholder sections that reference the new event IDs. These don't need the same depth as the LearnLoop originals since this is a demo app config.

### 4. Tests

New file `packages/journium-js/src/__tests__/autocapture-properties.test.ts`:

1. `$element_href` is captured for `<a>` elements, absent for `<button>`
2. `$page_title` is included in all autocapture events
3. `$element_semantic_classes` extracts names from CSS module pattern `Foo__hash__name`
4. `data-jrnm-*` attributes captured as `$attr_data_jrnm_*` properties
5. Custom `dataAttributePrefixes` + `dataAttributeNames` work correctly
6. Max 10 data attributes per element (capped)
7. Backward compat: `$element_classes` still present alongside `$element_semantic_classes`

---

## Verification

1. `pnpm --filter @journium/js test` — new autocapture property tests pass
2. `pnpm typecheck` — `dataAttributePrefixes` and `dataAttributeNames` propagate through all packages
3. `pnpm lint` — no lint errors
4. `pnpm build` — all packages build
