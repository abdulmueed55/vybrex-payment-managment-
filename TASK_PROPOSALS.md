# Codebase Issue Review: Proposed Tasks

## 1) Typo / Copy Fix Task
**Title:** Replace stale CRA test copy in `App.test.js`

**Issue found:** The existing test name and assertion still reference the default Create React App copy (`"renders learn react link"` / `/learn react/i`), but the app no longer renders that text.

**Why this matters:** This is misleading for developers and reads like leftover boilerplate rather than an intentional test.

**Task proposal:**
- Rename the test description to match actual behavior.
- Replace the stale text assertion with a real app assertion (for example, assert that the landing page content is rendered for `/`).

---

## 2) Bug Fix Task
**Title:** Align earnings balance API with real withdrawal accounting

**Issue found:** `requestWithdrawal` immediately deducts from `drivers.balance`, but `getBalance` computes available balance as `SUM(earnings) - SUM(withdrawals WHERE status='approved')`. Pending withdrawals are therefore excluded from the calculation even though funds are already reserved.

**Why this matters:** Users can see an inflated "Available Balance" after submitting a withdrawal request, causing confusing or contradictory UX.

**Task proposal:**
- Make `getBalance` use `drivers.balance` as the source of truth for available balance **or** include pending withdrawals consistently in the derived calculation.
- Add regression coverage for the pending-withdrawal scenario.

---

## 3) Comment / Documentation Discrepancy Task
**Title:** Correct `getCommissionRate` endpoint documentation/comment

**Issue found:** The comment says `// Get commission rate (public for drivers)`, but the route is protected by `authMiddleware`.

**Why this matters:** Inline docs are currently inaccurate and can mislead contributors or API consumers.

**Task proposal:**
- Update the comment to reflect actual access control (authenticated driver endpoint), or
- If intended to be public, remove auth protection and update API docs accordingly.

---

## 4) Test Improvement Task
**Title:** Replace the current smoke test with route-aware behavior tests

**Issue found:** The current single test in `App.test.js` is boilerplate and does not validate app behavior, routing, or auth expectations.

**Why this matters:** The test suite gives low confidence and can fail for irrelevant reasons.

**Task proposal:**
- Add route-focused tests for at least:
  - landing route (`/`) rendering,
  - protected page redirect behavior when token is missing,
  - a critical page headline or CTA per route.
- Use deterministic assertions tied to intentional UI copy/components.
