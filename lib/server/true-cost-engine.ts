// True Cost Engine — deterministic calculation with full breakdown
// Only includes components when evidence/data exists
import type { TrueCostBreakdown, DiscoveredSupplier, UploadedQuotation } from '../types';

export function calculateTrueCost(
  supplier: DiscoveredSupplier,
  quotation?: UploadedQuotation | null,
): TrueCostBreakdown {
  const notQuantified: string[] = [];
  let total = 0;

  // Quoted subtotal — from uploaded quotation if available, otherwise market listing
  let quotedSubtotal: TrueCostBreakdown['quotedSubtotal'] = null;
  if (quotation?.grandTotal?.value) {
    quotedSubtotal = { value: quotation.grandTotal.value, source: 'Uploaded quotation: ' + (quotation.fileName || 'document'), label: 'uploaded-document' };
    total += quotation.grandTotal.value;
  } else if (supplier.listings.length > 0 && supplier.listings[0].price.value) {
    const price = supplier.listings[0].price.value;
    const src = supplier.listings[0].source;
    quotedSubtotal = { value: price, source: src.url, label: 'live-web' };
    total += price;
  } else {
    notQuantified.push('Base price');
  }

  // Shipping
  let shipping: TrueCostBreakdown['shipping'] = null;
  if (quotation?.shipping?.value) {
    shipping = { value: quotation.shipping.value, source: 'Uploaded quotation', label: 'uploaded-document' };
    total += quotation.shipping.value;
  } else {
    notQuantified.push('Shipping');
  }

  // Tax
  let tax: TrueCostBreakdown['tax'] = null;
  if (quotation?.tax?.value) {
    tax = { value: quotation.tax.value, source: 'Uploaded quotation', label: 'uploaded-document' };
    total += quotation.tax.value;
  } else if (quotedSubtotal) {
    // Estimate GST at 18% if no tax data (label as calculated)
    const gst = Math.round(quotedSubtotal.value * 0.18);
    tax = { value: gst, source: 'Estimated GST @ 18%', label: 'calculated' };
    total += gst;
  } else {
    notQuantified.push('Applicable taxes');
  }

  // Logistics — not quantified without real data
  notQuantified.push('Logistics costs');

  // Delay impact — not quantified without historical data
  notQuantified.push('Delay impact');

  // Risk adjustment — not quantified without performance history
  notQuantified.push('Risk adjustment');

  // Discount
  let discount: TrueCostBreakdown['discount'] = null;

  const componentsIncluded = [quotedSubtotal, shipping, tax].filter(Boolean).length;

  return {
    quotedSubtotal,
    shipping,
    tax,
    logistics: null,
    delayImpact: null,
    riskAdjustment: null,
    discount,
    estimatedTotal: total,
    componentsIncluded,
    componentsNotQuantified: notQuantified,
    currency: 'INR',
  };
}
