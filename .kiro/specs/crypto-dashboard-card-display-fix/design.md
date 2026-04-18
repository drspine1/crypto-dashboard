# Crypto Dashboard Card Display Fix — Bugfix Design

## Overview

The crypto dashboard has three bugs that together cause cards to appear missing or display incorrect data in the Market Overview and Latest News sections.

**Bug 1 — Price Range Filter Silently Drops Assets**: `PRICE_RANGES.MAX` is hardcoded to `100000` in `constants.ts`, and `initialFilters.priceRange` defaults to `[0, 100000]` in `dashboardStore.ts`. `filterService.ts` applies this range as a strict upper bound, so Bitcoin (~$103,000) is silently excluded from `filteredCryptos`, causing the Market Overview grid to render fewer cards than expected.

**Bug 2 — GSAP Animation Leaves Cards Permanently Invisible**: `CryptoCard.tsx` and `NewsCard.tsx` both use `gsap.from(element, { opacity: 0, ... })`. `gsap.from` sets the element's CSS `opacity` to `0` at the start of the tween. If the animation is interrupted (React re-render, fast navigation, component unmount), GSAP never sets `opacity` back to `1`, leaving the card element invisible in the DOM.

**Bug 3 — `formatPrice` Missing Currency Symbol**: `formatPrice` in `formatters.ts` returns abbreviated strings like `"103.00K"` instead of properly formatted currency strings like `"$103,000.00"`, making price values on CryptoCards unclear and inconsistent with financial conventions.

The fix strategy is minimal and targeted: raise the price range ceiling to accommodate real-world crypto prices, replace `gsap.from` with a `gsap.fromTo` (or set opacity to 1 before animating) to guarantee final visibility, and rewrite `formatPrice` to use `Intl.NumberFormat` with USD currency formatting.

---

## Glossary

- **Bug_Condition (C)**: The specific input condition that triggers each bug.
- **Property (P)**: The desired correct behavior when the bug condition holds.
- **Preservation**: Existing behaviors that must remain unchanged after the fix.
- **`filterCryptos`**: The method in `src/services/filterService.ts` that applies `FilterOptions` (including `priceRange`) to the crypto list.
- **`initialFilters`**: The default `FilterOptions` object in `src/store/dashboardStore.ts` that seeds the Zustand store on initialization.
- **`PRICE_RANGES`**: The constant object in `src/utils/constants.ts` that defines `MIN`, `MAX`, and `STEP` for the price range slider.
- **`gsap.from`**: A GSAP tween that animates FROM the specified values TO the element's current CSS values. The element starts at the "from" values, which means it starts invisible when `opacity: 0` is specified.
- **`gsap.fromTo`**: A GSAP tween that animates FROM specified values TO specified values, giving explicit control over the final state.
- **`formatPrice`**: The function in `src/utils/formatters.ts` that converts a numeric price to a display string for CryptoCards.
- **`filteredCryptos`**: The Zustand store slice that holds the post-filter crypto array rendered by `MarketOverview`.
- **`filteredNews`**: The Zustand store slice that holds the post-filter news array rendered by `NewsFeed`.

---

## Bug Details

### Bug 1: Price Range Filter Silently Drops Assets

The bug manifests when a crypto asset's `price` exceeds the hardcoded `PRICE_RANGES.MAX` value of `100000`. The `filterCryptos` function in `filterService.ts` applies `crypto.price <= maxPrice` as a strict filter, and the default `priceRange` in `dashboardStore.ts` is `[0, 100000]`. Any asset priced above $100,000 (e.g., Bitcoin at ~$103,000) is silently excluded.

**Formal Specification:**
```
FUNCTION isBugCondition_PriceFilter(crypto)
  INPUT: crypto of type Crypto
  OUTPUT: boolean

  // Bug triggers when a valid crypto asset is excluded by the default price range cap
  RETURN crypto.price > PRICE_RANGES.MAX   // i.e., crypto.price > 100000
END FUNCTION
```

**Examples:**
- Bitcoin at $103,000 → excluded from `filteredCryptos` (bug); expected: included
- Ethereum at $3,500 → included (no bug)
- Solana at $150 → included (no bug)
- A hypothetical asset at exactly $100,000 → included (boundary, no bug)
- A hypothetical asset at $100,001 → excluded (bug)

---

### Bug 2: GSAP Animation Leaves Cards Permanently Invisible

The bug manifests when a `CryptoCard` or `NewsCard` mounts and the `gsap.from` animation is interrupted before it sets `opacity` back to `1`. Because `gsap.from` starts the element at `opacity: 0`, any interruption leaves the element permanently invisible.

**Formal Specification:**
```
FUNCTION isBugCondition_GsapOpacity(card)
  INPUT: card — a mounted CryptoCard or NewsCard React component instance
  OUTPUT: boolean

  animationInterrupted ← card.gsapTween.isActive() = false
                         AND card.gsapTween.progress() < 1
  RETURN animationInterrupted AND card.element.style.opacity = "0"
END FUNCTION
```

**Examples:**
- CryptoCard mounts, animation completes normally → `opacity: 1` (no bug)
- CryptoCard mounts, React re-renders before animation finishes → `opacity: 0` (bug)
- NewsCard at index 3 mounts with `delay: 0.24s`, component unmounts before delay elapses → `opacity: 0` (bug)
- NewsCard at index 0 mounts, animation completes → `opacity: 1` (no bug)

---

### Bug 3: `formatPrice` Missing Currency Symbol

The bug is present for all inputs to `formatPrice`. The function never prepends a `$` symbol and uses abbreviated notation (`K`, `M`) instead of standard currency formatting.

**Formal Specification:**
```
FUNCTION isBugCondition_FormatPrice(price)
  INPUT: price of type number
  OUTPUT: boolean

  // Bug is present for ALL price values — $ symbol is always missing
  RETURN NOT formatPrice(price).startsWith("$")
END FUNCTION
```

**Examples:**
- `formatPrice(103000)` → `"103.00K"` (bug); expected: `"$103,000.00"`
- `formatPrice(3500)` → `"3.50K"` (bug); expected: `"$3,500.00"`
- `formatPrice(0.45)` → `"0.45"` (bug); expected: `"$0.45"`
- `formatPrice(1500000)` → `"1.50M"` (bug); expected: `"$1,500,000.00"`

---

## Expected Behavior

### Preservation Requirements

**Unchanged Behaviors:**
- Search filtering: typing a query in the SearchBar must continue to filter both `filteredCryptos` and `filteredNews` in real time.
- Default display: when no filter has been applied by the user, all fetched crypto assets and news items must be shown (no restrictive price range applied by default).
- Price-flash animation: when a crypto asset's price updates via polling, the GSAP `gsap.to` flash animation (green/red background) on `CryptoCard` must continue to work exactly as before.
- `formatMarketCap` behavior: abbreviated notation (`"1.23B"`, `"456.78M"`) must remain unchanged — only `formatPrice` is being modified.
- `formatPrice` for sub-$1000 values: the numeric value represented must remain correct (e.g., `$0.45` for `0.45`).
- Skeleton loading: `loading.initial = true` must continue to render skeleton placeholders in both `MarketOverview` and `NewsFeed`.
- Error display: API errors must continue to render `ErrorAlert` in the affected section.
- Empty state: empty `filteredCryptos` or `filteredNews` must continue to render `EmptyState`.
- Mouse/pointer interactions: clicking cards, hovering, and all non-keyboard interactions must be unaffected.

**Scope:**
All inputs that do NOT satisfy the bug conditions above should be completely unaffected by this fix. Specifically:
- Crypto assets priced within `[0, 100000]` must filter identically before and after the fix.
- Cards whose GSAP animations complete normally must still animate (entrance animation is preserved).
- All formatter functions other than `formatPrice` are untouched.

---

## Hypothesized Root Cause

### Bug 1: Price Range Filter

1. **Hardcoded constant ceiling**: `PRICE_RANGES.MAX = 100000` in `constants.ts` was set when Bitcoin was below $100k. It now excludes Bitcoin at ~$103k.
2. **Default filter mirrors the constant**: `initialFilters.priceRange: [0, 100000]` in `dashboardStore.ts` directly uses the same ceiling, so the default state is already restrictive.
3. **Strict upper-bound filter**: `filterService.ts` applies `crypto.price <= maxPrice` with no special handling for "no upper limit" — there is no sentinel value (e.g., `Infinity`) to represent "show all".

### Bug 2: GSAP `gsap.from` Opacity

1. **`gsap.from` sets initial state immediately**: When `gsap.from(el, { opacity: 0 })` is called, GSAP immediately sets `el.style.opacity = "0"` and then animates toward the element's current computed opacity. If the tween is killed or the component unmounts before completion, the element stays at `opacity: 0`.
2. **No `onInterrupt` / `clearProps` fallback**: Neither `CryptoCard` nor `NewsCard` sets a fallback to restore opacity if the animation is interrupted.
3. **React StrictMode double-invoke**: In development, React StrictMode mounts components twice, which can cause the first tween to be interrupted by the second mount, leaving opacity at 0.
4. **Staggered delay compounds the risk**: `NewsCard` uses `delay: index * 0.08`, so cards with higher indices have longer windows during which an interruption can occur.

### Bug 3: `formatPrice` Missing `$`

1. **Manual string construction without currency symbol**: The function uses template literals (`\`${value}K\``) with no `$` prefix and no `Intl.NumberFormat` or similar locale-aware formatting.
2. **Abbreviated notation chosen over full currency format**: The original implementation prioritized compact display (like `formatMarketCap`) but was applied to price display where full currency notation is expected.

---

## Correctness Properties

Property 1: Bug Condition — Price Filter Includes High-Priced Assets

_For any_ crypto asset where `isBugCondition_PriceFilter` returns true (i.e., `crypto.price > 100000`), the fixed `filterCryptos` function with default filters SHALL include that asset in the returned array, so it appears in the Market Overview grid.

**Validates: Requirements 2.1, 2.2**

Property 2: Preservation — Price Filter Does Not Affect In-Range Assets

_For any_ crypto asset where `isBugCondition_PriceFilter` returns false (i.e., `crypto.price <= 100000`), the fixed `filterCryptos` function SHALL produce the same result as the original function — assets within the original range are neither added nor removed by the fix.

**Validates: Requirements 3.1, 3.2**

Property 3: Bug Condition — Card Visibility After Animation Interruption

_For any_ `CryptoCard` or `NewsCard` instance where `isBugCondition_GsapOpacity` returns true (animation interrupted before completion), the fixed component SHALL have `element.style.opacity` equal to `"1"` (or the element's computed opacity equal to `1`) after mount, ensuring the card is visible.

**Validates: Requirements 2.3, 2.5**

Property 4: Preservation — Entrance Animation Still Runs for Normal Mounts

_For any_ `CryptoCard` or `NewsCard` instance where the animation is NOT interrupted, the fixed component SHALL still execute the entrance animation (opacity transitions from 0 to 1 over the configured duration), preserving the visual entrance effect.

**Validates: Requirements 3.3**

Property 5: Bug Condition — `formatPrice` Includes Currency Symbol

_For any_ numeric price value, the fixed `formatPrice` function SHALL return a string that starts with `"$"` and represents the full numeric value in standard currency notation (e.g., `"$103,000.00"` for `103000`).

**Validates: Requirements 2.4**

Property 6: Preservation — `formatPrice` Numeric Value Unchanged for Sub-$1000 Prices

_For any_ price value less than `1000`, the fixed `formatPrice` function SHALL return a string whose numeric value (parsed from the formatted string) equals the original price rounded to 2 decimal places, preserving the correctness of small price display.

**Validates: Requirements 3.4**

---

## Fix Implementation

### Changes Required

Assuming our root cause analysis is correct:

---

**File**: `next-crypto/src/utils/constants.ts`

**Change**: Raise `PRICE_RANGES.MAX` to a value that accommodates current and near-future crypto prices.

**Specific Changes:**
1. **Raise the ceiling**: Change `MAX: 100000` to `MAX: 10_000_000` (ten million). This accommodates Bitcoin at any realistic near-term price and avoids the need to update this constant frequently.
2. **Update STEP accordingly**: Consider changing `STEP: 1000` to `STEP: 10000` to keep the slider usable at the new scale (optional, but improves UX).

---

**File**: `next-crypto/src/store/dashboardStore.ts`

**Change**: Update `initialFilters.priceRange` to use the new `PRICE_RANGES.MAX` (or use `Infinity` / a large sentinel) so the default state does not filter out any asset.

**Specific Changes:**
1. **Use `Infinity` as the default upper bound**: Change `priceRange: [0, 100000]` to `priceRange: [0, Infinity]`. This makes the default "show all" semantics explicit and immune to future constant changes.
   - Alternatively, import `PRICE_RANGES` and use `[PRICE_RANGES.MIN, PRICE_RANGES.MAX]` to keep the default tied to the constant.

---

**File**: `next-crypto/src/services/filterService.ts`

**Change**: Handle `Infinity` as the upper bound gracefully (the existing `crypto.price <= maxPrice` already works with `Infinity` in JavaScript, so no code change is strictly required if `dashboardStore.ts` uses `Infinity`). If `PRICE_RANGES.MAX` is used instead, no change is needed here either.

**Specific Changes:**
1. **No change required** if `dashboardStore.ts` defaults to `[0, Infinity]` — `crypto.price <= Infinity` is always `true`.
2. **Optional defensive guard**: Add a comment clarifying that `maxPrice = Infinity` means "no upper limit".

---

**File**: `next-crypto/src/components/Cards/CryptoCard.tsx`

**Change**: Replace `gsap.from` with `gsap.fromTo` to explicitly set the final state, guaranteeing the card is visible even if the animation is interrupted.

**Specific Changes:**
1. **Replace `gsap.from` with `gsap.fromTo`**:
   ```ts
   // Before
   gsap.from(cardRef.current, { opacity: 0, y: 10, duration: 0.5 })

   // After
   gsap.fromTo(cardRef.current,
     { opacity: 0, y: 10 },
     { opacity: 1, y: 0, duration: 0.5 }
   )
   ```
2. **Store the tween and kill on unmount**: Return a cleanup function from `useEffect` that kills the tween to prevent memory leaks and double-animation in React StrictMode.

---

**File**: `next-crypto/src/components/Cards/NewsCard.tsx`

**Change**: Same pattern as `CryptoCard.tsx` — replace `gsap.from` with `gsap.fromTo`.

**Specific Changes:**
1. **Replace `gsap.from` with `gsap.fromTo`**:
   ```ts
   // Before
   gsap.from(cardRef.current, { opacity: 0, x: -20, duration: 0.5, delay: index * 0.08 })

   // After
   gsap.fromTo(cardRef.current,
     { opacity: 0, x: -20 },
     { opacity: 1, x: 0, duration: 0.5, delay: index * 0.08 }
   )
   ```
2. **Store the tween and kill on unmount**: Return a cleanup function from `useEffect`.

---

**File**: `next-crypto/src/utils/formatters.ts`

**Change**: Rewrite `formatPrice` to use `Intl.NumberFormat` with USD currency style, producing full currency strings like `"$103,000.00"`.

**Specific Changes:**
1. **Use `Intl.NumberFormat`**:
   ```ts
   export const formatPrice = (price: number): string => {
     return new Intl.NumberFormat('en-US', {
       style: 'currency',
       currency: 'USD',
       minimumFractionDigits: 2,
       maximumFractionDigits: 2,
     }).format(price)
   }
   ```
2. **No changes to `formatMarketCap`** — abbreviated notation is intentional for market cap display.

---

## Testing Strategy

### Validation Approach

The testing strategy follows a two-phase approach: first, surface counterexamples that demonstrate each bug on the unfixed code, then verify the fix works correctly and preserves existing behavior. Property-based testing is used for preservation checking to provide strong guarantees across the full input domain.

---

### Exploratory Bug Condition Checking

**Goal**: Surface counterexamples that demonstrate each bug BEFORE implementing the fix. Confirm or refute the root cause analysis.

**Test Plan**: Write unit tests that exercise each bug condition directly against the unfixed code. Run these tests on the UNFIXED code to observe failures and understand the root cause.

**Test Cases**:

1. **Price Filter — Bitcoin Excluded** (will fail on unfixed code):
   Call `filterService.filterCryptos([{ id: 'bitcoin', price: 103000, ... }], defaultFilters)` and assert the result contains Bitcoin. On unfixed code, the result will be empty.

2. **Price Filter — Only In-Range Asset Shown** (will fail on unfixed code):
   Call `filterCryptos` with `[bitcoin@103000, ethereum@3500]` and default filters. Assert both are returned. On unfixed code, only Ethereum is returned.

3. **GSAP Opacity — CryptoCard Interrupted** (will fail on unfixed code):
   Mount `CryptoCard`, immediately kill the GSAP tween, and assert `cardRef.current.style.opacity === "1"`. On unfixed code, opacity remains `"0"`.

4. **GSAP Opacity — NewsCard with Delay Interrupted** (will fail on unfixed code):
   Mount `NewsCard` with `index=3` (delay = 0.24s), kill the tween before it starts, and assert opacity is `"1"`. On unfixed code, opacity remains `"0"`.

5. **formatPrice — Missing Dollar Sign** (will fail on unfixed code):
   Call `formatPrice(103000)` and assert the result starts with `"$"`. On unfixed code, result is `"103.00K"`.

6. **formatPrice — Abbreviated Instead of Full Value** (will fail on unfixed code):
   Call `formatPrice(103000)` and assert the result equals `"$103,000.00"`. On unfixed code, result is `"103.00K"`.

**Expected Counterexamples**:
- `filterCryptos` returns `[]` for Bitcoin at $103,000 with default filters (confirms hardcoded MAX bug)
- `cardRef.current.style.opacity` is `"0"` after tween kill (confirms `gsap.from` sets initial opacity)
- `formatPrice(103000)` returns `"103.00K"` (confirms missing `$` and abbreviated format)

---

### Fix Checking

**Goal**: Verify that for all inputs where each bug condition holds, the fixed functions produce the expected behavior.

**Pseudocode:**
```
// Bug 1
FOR ALL crypto WHERE isBugCondition_PriceFilter(crypto) DO
  result := filterCryptos_fixed([crypto], defaultFilters)
  ASSERT crypto IN result
END FOR

// Bug 2
FOR ALL card WHERE isBugCondition_GsapOpacity(card) DO
  result := card.element.style.opacity  // after mount + tween kill
  ASSERT result = "1"
END FOR

// Bug 3
FOR ALL price WHERE isBugCondition_FormatPrice(price) DO
  result := formatPrice_fixed(price)
  ASSERT result.startsWith("$")
  ASSERT result = Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(price)
END FOR
```

---

### Preservation Checking

**Goal**: Verify that for all inputs where each bug condition does NOT hold, the fixed functions produce the same result as the original functions.

**Pseudocode:**
```
// Bug 1 — in-range assets unaffected
FOR ALL crypto WHERE NOT isBugCondition_PriceFilter(crypto) DO
  ASSERT filterCryptos_original([crypto], filters) = filterCryptos_fixed([crypto], filters)
END FOR

// Bug 2 — normal (non-interrupted) animations still run
FOR ALL card WHERE NOT isBugCondition_GsapOpacity(card) DO
  ASSERT card.entranceAnimation.runs = true
  ASSERT card.element.style.opacity transitions from "0" to "1"
END FOR

// Bug 3 — sub-$1000 prices retain correct numeric value
FOR ALL price WHERE price < 1000 DO
  ASSERT numericValueOf(formatPrice_fixed(price)) = price rounded to 2 decimal places
END FOR
```

**Testing Approach**: Property-based testing is recommended for preservation checking because:
- It generates many test cases automatically across the input domain (e.g., random prices in `[0, 100000]`)
- It catches edge cases that manual unit tests might miss (e.g., prices at boundary values like `0`, `0.001`, `999.99`)
- It provides strong guarantees that behavior is unchanged for all non-buggy inputs

**Test Plan**: Observe behavior on UNFIXED code first for in-range assets and sub-$1000 prices, then write property-based tests capturing that behavior.

**Test Cases**:
1. **In-Range Asset Preservation**: Verify that Ethereum ($3,500), Solana ($150), Cardano ($0.45), and Ripple ($2.30) are included in `filteredCryptos` both before and after the fix.
2. **formatPrice Sub-$1000 Preservation**: Verify that `formatPrice(0.45)` returns `"$0.45"` and `formatPrice(999.99)` returns `"$999.99"` after the fix.
3. **Price-Flash Animation Preservation**: Verify that the `gsap.to` price-flash animation in `CryptoCard` (triggered by `priceUpdate`) is unaffected by the `gsap.fromTo` entrance animation change.
4. **formatMarketCap Unchanged**: Verify that `formatMarketCap` output is identical before and after the fix.

---

### Unit Tests

- Test `filterService.filterCryptos` with Bitcoin at $103,000 and default filters — assert it is included after fix
- Test `filterService.filterCryptos` with assets at boundary values ($0, $100,000, $100,001, $10,000,000)
- Test `formatPrice` with representative values: `0.45`, `3500`, `103000`, `1500000`
- Test `formatPrice` always returns a string starting with `"$"`
- Test `CryptoCard` renders with `opacity: 1` after mount (using React Testing Library + jest-environment-jsdom)
- Test `NewsCard` renders with `opacity: 1` after mount for all index values (0–9)
- Test that killing the GSAP tween on `CryptoCard` does not leave opacity at 0

### Property-Based Tests

- Generate random prices in `[0, 100000]` and verify `filterCryptos` behavior is identical before and after fix (preservation)
- Generate random prices across the full range `[0, 10_000_000]` and verify all are included with default filters after fix (fix checking)
- Generate random price values and verify `formatPrice` always returns a string matching `/^\$[\d,]+\.\d{2}$/`
- Generate random price values `< 1000` and verify the numeric value in the formatted string equals the input rounded to 2 decimal places

### Integration Tests

- Load the full `MarketOverview` component with mocked API data including Bitcoin at $103,000 — assert 5 cards render
- Load `NewsFeed` with 4 mocked news items — assert all 4 `NewsCard` elements are visible (`opacity: 1`)
- Verify the search filter still works after the price range fix (type a query, assert filtered results)
- Verify the price-flash animation fires correctly after a `priceUpdate` event on a `CryptoCard`
- Verify `formatPrice` output appears correctly in the rendered `CryptoCard` price field
