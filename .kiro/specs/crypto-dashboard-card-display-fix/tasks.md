# Implementation Plan

- [ ] 1. Write bug condition exploration tests (BEFORE implementing any fix)
  - **Property 1: Bug Condition** - Price Filter, GSAP Opacity, and formatPrice Bugs
  - **CRITICAL**: These tests MUST FAIL on unfixed code — failure confirms the bugs exist
  - **DO NOT attempt to fix the tests or the code when they fail**
  - **NOTE**: These tests encode the expected behavior — they will validate the fixes when they pass after implementation
  - **GOAL**: Surface counterexamples that demonstrate each bug exists
  - Set up a test framework (e.g., Vitest + jsdom) in `next-crypto` if not already present
  - **Bug 1 — Price Filter (scoped PBT)**: Call `filterService.filterCryptos([{ id: 'bitcoin', price: 103000, ... }], { priceRange: [0, 100000], ... })` and assert the result contains Bitcoin. On unfixed code, result is `[]` — counterexample: `filterCryptos([bitcoin@103000], defaultFilters)` returns `[]` instead of `[bitcoin]`
  - **Bug 2 — GSAP CryptoCard (scoped PBT)**: Mount `CryptoCard`, immediately kill the GSAP tween (simulating interruption), and assert `cardRef.current.style.opacity === "1"`. On unfixed code, opacity remains `"0"` — counterexample: `opacity` is `"0"` after tween kill
  - **Bug 2 — GSAP NewsCard with delay (scoped PBT)**: Mount `NewsCard` with `index=3` (delay = 0.24s), kill the tween before it starts, and assert opacity is `"1"`. On unfixed code, opacity remains `"0"` — counterexample: `opacity` is `"0"` after tween kill
  - **Bug 3 — formatPrice missing $ (scoped PBT)**: Call `formatPrice(103000)` and assert result starts with `"$"`. On unfixed code, result is `"103.00K"` — counterexample: `formatPrice(103000)` returns `"103.00K"` instead of `"$103,000.00"`
  - Run all tests on UNFIXED code
  - **EXPECTED OUTCOME**: All tests FAIL (this is correct — it proves the bugs exist)
  - Document counterexamples found to understand root cause
  - Mark task complete when tests are written, run, and failures are documented
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5_

- [ ] 2. Write preservation property tests (BEFORE implementing any fix)
  - **Property 2: Preservation** - In-Range Assets, Sub-$1000 Prices, and formatMarketCap
  - **IMPORTANT**: Follow observation-first methodology — observe behavior on UNFIXED code first
  - Observe: `filterService.filterCryptos([ethereum@3500, solana@150, cardano@0.45, ripple@2.30], defaultFilters)` returns all four assets on unfixed code
  - Observe: `formatPrice(0.45)` returns `"0.45"` on unfixed code (numeric value is correct, just missing `$`)
  - Observe: `formatMarketCap(1_230_000_000)` returns `"1.23B"` on unfixed code
  - **Preservation PBT 1**: For all crypto prices in `[0, 100000]`, `filterCryptos` with default filters includes the asset — verify this passes on UNFIXED code
  - **Preservation PBT 2**: For all prices `< 1000`, the numeric value parsed from `formatPrice(price)` equals `price` rounded to 2 decimal places — verify this passes on UNFIXED code (the numeric value is already correct, only the `$` prefix is missing)
  - **Preservation PBT 3**: `formatMarketCap` output is identical before and after the fix for all representative values
  - Run all preservation tests on UNFIXED code
  - **EXPECTED OUTCOME**: Tests PASS (this confirms baseline behavior to preserve)
  - Mark task complete when tests are written, run, and passing on unfixed code
  - _Requirements: 3.1, 3.2, 3.4, 3.5_

- [ ] 3. Fix Bug 1 — Raise price range ceiling in `constants.ts`
  - [ ] 3.1 Update `PRICE_RANGES.MAX` in `next-crypto/src/utils/constants.ts`
    - Change `MAX: 100000` to `MAX: 10_000_000`
    - Optionally update `STEP: 1000` to `STEP: 10000` for usable slider UX at the new scale
    - _Bug_Condition: isBugCondition_PriceFilter(crypto) where crypto.price > 100000 (e.g., Bitcoin at ~$103,000)_
    - _Expected_Behavior: filterCryptos with default filters includes all assets regardless of price_
    - _Preservation: Assets priced within [0, 100000] must filter identically before and after the fix_
    - _Requirements: 2.1, 2.2, 3.1, 3.2_

- [ ] 4. Fix Bug 1 — Update default price range in `dashboardStore.ts`
  - [ ] 4.1 Update `initialFilters.priceRange` in `next-crypto/src/store/dashboardStore.ts`
    - Change `priceRange: [0, 100000]` to `priceRange: [0, Infinity]`
    - This makes "show all" semantics explicit and immune to future constant changes
    - `filterService.ts` requires no change — `crypto.price <= Infinity` is always `true` in JavaScript
    - _Bug_Condition: isBugCondition_PriceFilter(crypto) where crypto.price > 100000_
    - _Expected_Behavior: Default store state does not apply any restrictive upper price bound_
    - _Preservation: User-applied price range filters must continue to work; search filtering unaffected_
    - _Requirements: 2.1, 2.2, 3.1, 3.2_

- [ ] 5. Fix Bug 2 — Replace `gsap.from` with `gsap.fromTo` in `CryptoCard.tsx`
  - [ ] 5.1 Update entrance animation in `next-crypto/src/components/Cards/CryptoCard.tsx`
    - Replace `gsap.from(cardRef.current, { opacity: 0, y: 10, duration: 0.5 })` with:
      ```ts
      const tween = gsap.fromTo(
        cardRef.current,
        { opacity: 0, y: 10 },
        { opacity: 1, y: 0, duration: 0.5 }
      )
      return () => { tween.kill() }
      ```
    - Store the tween reference and return a cleanup function from `useEffect` to kill it on unmount
    - This prevents memory leaks and double-animation in React StrictMode
    - The `gsap.to` price-flash animation (triggered by `priceUpdate`) is untouched
    - _Bug_Condition: isBugCondition_GsapOpacity(card) where animation is interrupted before completion_
    - _Expected_Behavior: card.element.style.opacity === "1" after mount regardless of animation interruption_
    - _Preservation: Price-flash animation (gsap.to on priceUpdate) must continue to work; entrance animation still runs for normal mounts_
    - _Requirements: 2.3, 3.3_

- [ ] 6. Fix Bug 2 — Replace `gsap.from` with `gsap.fromTo` in `NewsCard.tsx`
  - [ ] 6.1 Update entrance animation in `next-crypto/src/components/Cards/NewsCard.tsx`
    - Replace `gsap.from(cardRef.current, { opacity: 0, x: -20, duration: 0.5, delay: index * 0.08 })` with:
      ```ts
      const tween = gsap.fromTo(
        cardRef.current,
        { opacity: 0, x: -20 },
        { opacity: 1, x: 0, duration: 0.5, delay: index * 0.08 }
      )
      return () => { tween.kill() }
      ```
    - Store the tween reference and return a cleanup function from `useEffect` to kill it on unmount
    - _Bug_Condition: isBugCondition_GsapOpacity(card) where animation is interrupted (especially high-index cards with longer delays)_
    - _Expected_Behavior: All NewsCards are visible (opacity: 1) after mount regardless of staggered delay or interruption_
    - _Preservation: Staggered entrance animation still runs for normal mounts; all card content and interactions unaffected_
    - _Requirements: 2.3, 2.5, 3.3_

- [ ] 7. Fix Bug 3 — Rewrite `formatPrice` with `Intl.NumberFormat` in `formatters.ts`
  - [ ] 7.1 Update `formatPrice` in `next-crypto/src/utils/formatters.ts`
    - Replace the current abbreviated implementation with:
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
    - Do NOT modify `formatMarketCap` — abbreviated notation is intentional for market cap display
    - _Bug_Condition: isBugCondition_FormatPrice(price) — true for ALL price values ($ symbol always missing)_
    - _Expected_Behavior: formatPrice(price).startsWith("$") AND result equals Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(price)_
    - _Preservation: formatPrice for sub-$1000 values must retain correct numeric value (e.g., "$0.45" for 0.45); formatMarketCap unchanged_
    - _Requirements: 2.4, 3.4, 3.5_

- [ ] 8. Verify bug condition exploration tests now pass

  - [ ] 8.1 Re-run the SAME tests from task 1 on the FIXED code
    - **Property 1: Expected Behavior** - Price Filter, GSAP Opacity, and formatPrice Bugs
    - **IMPORTANT**: Re-run the SAME tests from task 1 — do NOT write new tests
    - The tests from task 1 encode the expected behavior; when they pass, the bugs are fixed
    - Run all bug condition exploration tests from step 1
    - **EXPECTED OUTCOME**: All tests PASS (confirms all three bugs are fixed)
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5_

  - [ ] 8.2 Verify preservation tests still pass
    - **Property 2: Preservation** - In-Range Assets, Sub-$1000 Prices, and formatMarketCap
    - **IMPORTANT**: Re-run the SAME tests from task 2 — do NOT write new tests
    - Run all preservation property tests from step 2
    - **EXPECTED OUTCOME**: Tests PASS (confirms no regressions)
    - Confirm all tests still pass after fixes (no regressions)

- [ ] 9. Checkpoint — Ensure all tests pass
  - Ensure all tests pass; ask the user if questions arise
  - Verify the full test suite (exploration + preservation) passes cleanly
  - Confirm no TypeScript compilation errors (`tsc --noEmit` in `next-crypto/`)
  - Confirm no ESLint errors (`eslint` in `next-crypto/`)
