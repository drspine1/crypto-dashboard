# Bugfix Requirements Document

## Introduction

The crypto dashboard has two related card display bugs affecting the Market Overview and Latest News sections. In both cases, only one card (or no cards) renders visibly, making the dashboard appear broken to users. The root causes are: (1) a price range filter with a hardcoded maximum of $100,000 that silently drops high-priced assets like Bitcoin, and (2) GSAP `gsap.from` entrance animations that set `opacity: 0` as the starting value — if the animation does not complete (e.g., component unmounts, re-renders, or GSAP runs before paint), cards remain permanently invisible. A secondary issue is that `formatPrice` omits the `$` currency symbol and uses abbreviated notation (`60.00K`) instead of a proper currency format, making card content unclear.

---

## Bug Analysis

### Current Behavior (Defect)

1.1 WHEN the dashboard loads and `filteredCryptos` contains a crypto asset whose `price` exceeds `100000` (e.g., Bitcoin at ~$103,000) THEN the system silently excludes that asset from the rendered grid, showing fewer cards than expected.

1.2 WHEN `filteredCryptos` contains only one asset priced within `[0, 100000]` THEN the system renders only that single card in the Market Overview grid, making the section appear nearly empty.

1.3 WHEN a `CryptoCard` or `NewsCard` component mounts and the GSAP `gsap.from` animation starts with `opacity: 0` THEN the system may leave the card element at `opacity: 0` if the animation is interrupted (e.g., by a React re-render, fast navigation, or GSAP timing issues), making the card invisible even though it is present in the DOM.

1.4 WHEN `formatPrice` is called with a price value of `103000` THEN the system returns the string `"103.00K"` — omitting the `$` currency symbol and using an abbreviated format — making the price display on CryptoCards unclear and inconsistent with standard financial notation.

1.5 WHEN the dashboard loads and `filteredNews` contains news items THEN the system may render only one visible NewsCard because the staggered GSAP `gsap.from` animations (with `opacity: 0` and `x: -20` starting values) on subsequent cards do not complete, leaving them invisible.

### Expected Behavior (Correct)

2.1 WHEN the dashboard loads and `filteredCryptos` contains a crypto asset whose `price` exceeds `100000` THEN the system SHALL include that asset in the rendered Market Overview grid.

2.2 WHEN `filteredCryptos` contains five assets (the configured set: bitcoin, ethereum, cardano, solana, ripple) THEN the system SHALL render all five CryptoCards in the Market Overview grid.

2.3 WHEN a `CryptoCard` or `NewsCard` component mounts THEN the system SHALL ensure the card is visible (opacity reaches 1) regardless of whether the GSAP entrance animation completes, by setting the element's opacity to 1 before or immediately after initiating the animation.

2.4 WHEN `formatPrice` is called with a price value of `103000` THEN the system SHALL return a string that includes the `$` currency symbol and represents the value clearly (e.g., `"$103,000.00"`).

2.5 WHEN the dashboard loads and `filteredNews` contains news items THEN the system SHALL render all NewsCards visibly, with staggered entrance animations that do not leave any card permanently invisible.

### Unchanged Behavior (Regression Prevention)

3.1 WHEN a user types a search query into the SearchBar THEN the system SHALL CONTINUE TO filter both `filteredCryptos` and `filteredNews` in real time, hiding items that do not match the query.

3.2 WHEN a user has not interacted with any filter THEN the system SHALL CONTINUE TO display all fetched crypto assets and news items without applying any restrictive price range filter by default.

3.3 WHEN a crypto asset's price updates via polling THEN the system SHALL CONTINUE TO trigger the GSAP price-flash animation on the affected CryptoCard (green flash for price increase, red flash for price decrease).

3.4 WHEN `formatPrice` is called with a value below `1000` THEN the system SHALL CONTINUE TO return a formatted string representing the full value (e.g., `"$0.45"` for `0.45`).

3.5 WHEN `formatMarketCap` is called THEN the system SHALL CONTINUE TO return abbreviated notation (e.g., `"1.23B"`, `"456.78M"`) as it is used for market cap display, not price display.

3.6 WHEN the `loading.initial` state is `true` THEN the system SHALL CONTINUE TO render skeleton placeholders in both MarketOverview and NewsFeed instead of the actual cards.

3.7 WHEN an API error occurs for crypto or news THEN the system SHALL CONTINUE TO display the ErrorAlert component within the affected section.

3.8 WHEN `filteredCryptos` or `filteredNews` is empty after filtering THEN the system SHALL CONTINUE TO display the EmptyState component in the respective section.

---

## Bug Condition Pseudocode

### Bug 1: Price Range Filter Silently Drops Assets

```pascal
FUNCTION isBugCondition_PriceFilter(crypto)
  INPUT: crypto of type Crypto
  OUTPUT: boolean

  // Bug triggers when a valid crypto asset is excluded by the default price range cap
  RETURN crypto.price > 100000
END FUNCTION

// Property: Fix Checking — all fetched cryptos appear in the grid
FOR ALL crypto IN fetchedCryptos WHERE isBugCondition_PriceFilter(crypto) DO
  result ← filteredCryptos'
  ASSERT crypto IN result
END FOR

// Property: Preservation Checking — cryptos within range are unaffected
FOR ALL crypto IN fetchedCryptos WHERE NOT isBugCondition_PriceFilter(crypto) DO
  ASSERT filterCryptos(crypto, defaultFilters) = filterCryptos'(crypto, defaultFilters)
END FOR
```

### Bug 2: GSAP Animation Leaves Cards Invisible

```pascal
FUNCTION isBugCondition_GsapOpacity(card)
  INPUT: card of type CryptoCard | NewsCard (mounted React component)
  OUTPUT: boolean

  // Bug triggers when gsap.from starts with opacity: 0 and animation is interrupted
  RETURN card.animationInterrupted = true AND card.element.opacity = 0
END FUNCTION

// Property: Fix Checking — card is always visible after mount
FOR ALL card WHERE isBugCondition_GsapOpacity(card) DO
  result ← card.element.opacity
  ASSERT result = 1
END FOR

// Property: Preservation Checking — animation still runs for normal mounts
FOR ALL card WHERE NOT isBugCondition_GsapOpacity(card) DO
  ASSERT card.entranceAnimation.runs = true
END FOR
```

### Bug 3: formatPrice Missing Currency Symbol

```pascal
FUNCTION isBugCondition_FormatPrice(price)
  INPUT: price of type number
  OUTPUT: boolean

  // Bug is present for all price values — the $ symbol is always missing
  RETURN true
END FUNCTION

// Property: Fix Checking — formatted price always includes $ symbol
FOR ALL price WHERE isBugCondition_FormatPrice(price) DO
  result ← formatPrice'(price)
  ASSERT result.startsWith("$")
END FOR

// Property: Preservation Checking — numeric value representation is unchanged
FOR ALL price WHERE price < 1000 DO
  ASSERT numericValueOf(formatPrice(price)) = numericValueOf(formatPrice'(price))
END FOR
```
