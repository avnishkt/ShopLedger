'use strict';

const { test } = require('node:test');
const assert = require('node:assert');
const invoice = require('../lib/invoice');
const pricing = require('../lib/pricing');

function line(name, price, qty, hsn, gstRate) {
  return { name, sku: name, price, qty, hsn, gstRate };
}

function checkScenario(items, coupon, expectedInvoice, expectedCheckout) {
  const order = { id: 1, coupon, items };
  const invoiceFigures = invoice.computeInvoiceFigures(order);
  const checkoutFigures = pricing.computeTotals(items, coupon);

  assert.deepEqual(invoiceFigures, expectedInvoice);
  assert.equal(checkoutFigures.tax, expectedCheckout.tax);
  assert.equal(checkoutFigures.total, expectedCheckout.total);
}

test('CURRENT BEHAVIOUR: order #1001 invoice uses supplied 5% and 12% GST rates without a coupon', function () {
  checkScenario([
    line('Toor Dal', 165, 2, '0713', 5),
    line('Ghee', 450, 1, '0405', 12)
  ], '', {
    subtotal: 780,
    discount: 0,
    tax: 70.5,
    cgst: 35.25,
    sgst: 35.25,
    total: 850.5,
    rows: [
      { name: 'Toor Dal', sku: 'Toor Dal', hsn: '0713', qty: 2, price: 165, gstPercent: 5, line: 330, lineTax: 16.5 },
      { name: 'Ghee', sku: 'Ghee', hsn: '0405', qty: 1, price: 450, gstPercent: 12, line: 450, lineTax: 54 }
    ]
  }, { tax: 70.5, total: 850.5 });
});

test('EXPECTED BEHAVIOUR: order #1002 SAVE10 invoice matches checkout before-tax discount', function () {
  checkScenario([
    line('Rice', 640, 1, '1006', 5),
    line('Sunflower Oil', 190, 2, '1512', 5)
  ], 'SAVE10', {
    subtotal: 1020,
    discount: 102,
    tax: 45.9,
    cgst: 22.95,
    sgst: 22.95,
    total: 963.9,
    rows: [
      { name: 'Rice', sku: 'Rice', hsn: '1006', qty: 1, price: 640, gstPercent: 5, line: 640, lineTax: 28.8 },
      { name: 'Sunflower Oil', sku: 'Sunflower Oil', hsn: '1512', qty: 2, price: 190, gstPercent: 5, line: 380, lineTax: 17.1 }
    ]
  }, { tax: 45.9, total: 963.9 });
});

test('EXPECTED BEHAVIOUR: order #1004 SAVE10 invoice applies the ₹150 discount cap before tax', function () {
  checkScenario([
    line('Groundnut Oil', 1120, 2, '1508', 5)
  ], 'SAVE10', {
    subtotal: 2240,
    discount: 150,
    tax: 104.5,
    cgst: 52.25,
    sgst: 52.25,
    total: 2194.5,
    rows: [
      { name: 'Groundnut Oil', sku: 'Groundnut Oil', hsn: '1508', qty: 2, price: 1120, gstPercent: 5, line: 2240, lineTax: 104.5 }
    ]
  }, { tax: 104.5, total: 2194.5 });
});

test('CURRENT BEHAVIOUR: order #1008 all-18% invoice and checkout match without a coupon', function () {
  checkScenario([
    line('Packaged Tea', 140, 1, '0902', 18),
    line('Coffee', 310, 1, '0901', 18),
    line('Syrup', 180, 1, '2106', 18)
  ], '', {
    subtotal: 630,
    discount: 0,
    tax: 113.4,
    cgst: 56.7,
    sgst: 56.7,
    total: 743.4,
    rows: [
      { name: 'Packaged Tea', sku: 'Packaged Tea', hsn: '0902', qty: 1, price: 140, gstPercent: 18, line: 140, lineTax: 25.2 },
      { name: 'Coffee', sku: 'Coffee', hsn: '0901', qty: 1, price: 310, gstPercent: 18, line: 310, lineTax: 55.8 },
      { name: 'Syrup', sku: 'Syrup', hsn: '2106', qty: 1, price: 180, gstPercent: 18, line: 180, lineTax: 32.4 }
    ]
  }, { tax: 113.4, total: 743.4 });
});

test('EXPECTED BEHAVIOUR: invoice matches checkout HSN GST with capped coupon before tax', function () {
  checkScenario([
    { name: 'Rice', sku: 'GRN-001', price: 1400, qty: 1, hsn: '1006' },
    { name: 'Ghee', sku: 'DRY-001', price: 840, qty: 1, hsn: '0405' }
  ], 'SAVE10', {
    subtotal: 2240,
    discount: 150,
    tax: 159.36,
    cgst: 79.68,
    sgst: 79.68,
    total: 2249.36,
    rows: [
      { name: 'Rice', sku: 'GRN-001', hsn: '1006', qty: 1, price: 1400, gstPercent: 5, line: 1400, lineTax: 65.31 },
      { name: 'Ghee', sku: 'DRY-001', hsn: '0405', qty: 1, price: 840, gstPercent: 12, line: 840, lineTax: 94.05 }
    ]
  }, { tax: 159.36, total: 2249.36 });
});
