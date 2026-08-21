// Market Intelligence — aggregates prices, detects anomalies, calculates market range
import { nanoid } from 'nanoid';
import type { DiscoveredSupplier, MarketPriceRange, PriceAnomaly } from '../types';

export function calculateMarketRange(suppliers: DiscoveredSupplier[], currency = 'INR'): MarketPriceRange | null {
  // Collect all listed prices across all suppliers
  const pricePoints: { price: number; source: any }[] = [];

  for (const sup of suppliers) {
    for (const listing of sup.listings) {
      if (listing.price.value && listing.price.value > 0 && listing.currency.value === currency) {
        pricePoints.push({ price: listing.price.value, source: listing.source });
      }
    }
  }

  if (pricePoints.length === 0) return null;

  const prices = pricePoints.map(p => p.price).sort((a, b) => a - b);
  const lowest = prices[0];
  const highest = prices[prices.length - 1];
  const median = prices.length % 2 === 0
    ? (prices[prices.length / 2 - 1] + prices[prices.length / 2]) / 2
    : prices[Math.floor(prices.length / 2)];

  // Detect anomalies (price more than 30% away from median)
  const anomalies: PriceAnomaly[] = [];
  for (const pp of pricePoints) {
    const deviation = ((pp.price - median) / median) * 100;
    if (Math.abs(deviation) > 30) {
      anomalies.push({
        price: pp.price,
        source: pp.source,
        deviation: Math.round(deviation),
        reason: deviation < 0
          ? `Price is ${Math.abs(Math.round(deviation))}% below observed median. Requires verification.`
          : `Price is ${Math.round(deviation)}% above observed median.`,
      });
    }
  }

  return {
    currency,
    lowest,
    highest,
    median: Math.round(median),
    sourceCount: pricePoints.length,
    sources: pricePoints.map(p => p.source),
    lastUpdated: new Date().toISOString(),
    anomalies,
  };
}
