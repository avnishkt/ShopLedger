# ShopLedger

## Stack
- Node.js CommonJS app using Express 4 and body-parser; browser UI is static HTML, CSS, and JavaScript in `public/`.
- Persistent application data is stored as JSON in `data/db.json` through `lib/store.js`.

## Module map
- `routes/customers.js` — lists customers and settlements; records a customer settlement.
- `routes/orders.js` — lists and reads orders; places and cancels orders.
- `routes/products.js` — lists products and active coupons.
- `routes/reports.js` — dashboard, GST reconciliation, checkout pricing preview, and admin export endpoints.
- `lib/coupons.js` — normalizes, validates, and calculates coupon discounts; lists active coupons.
- `lib/dates.js` — formats today’s date, normalizes date keys, and derives fiscal year.
- `lib/inventory.js` — product lookup, sellable stock checks, stock reservation/release, and inventory summary.
- `lib/invoice.js` — recalculates invoice figures and renders printable invoice HTML.
- `lib/ledger.js` — customer balances, Khata order debits/reversals, and settlements.
- `lib/orders.js` — adds, gets, cancels, and filters orders.
- `lib/pricing.js` — subtotal, coupon discount delegation, and checkout tax/total calculation.
- `lib/reports.js` — dashboard summary and invoice-versus-order GST reconciliation.
- `lib/store.js` — reads/writes `data/db.json` and appends bounded audit entries.
- `lib/tax.js` — resolves item GST rates/slabs and splits GST into CGST and SGST.

## Commands
- Start the app: `npm start` (runs `node server.js`).
- Run tests: `node --test` (Node’s built-in test runner; `package.json` has no implemented test script).

## Rules
1. Write characterization tests before changing behaviour.
2. Change only the module(s) the ticket is about.
3. Tests never read or write `data/db.json`; use in-memory data.
4. Add no dependencies.
5. Make the smallest fix that works.

## Current ticket
- Invoice total and GST breakdown do not match what the customer was billed.
- Allowed files: `lib/invoice.js` (`lib/tax.js` only if truly needed).
