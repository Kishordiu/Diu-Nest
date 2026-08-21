// Risk Engine — evidence-derived risk signals, no random scores
import { nanoid } from 'nanoid';
import type { DiscoveredSupplier, RiskSignal, MarketPriceRange } from '../types';

export function analyzeRisks(
  supplier: DiscoveredSupplier,
  marketRange?: MarketPriceRange | null,
): RiskSignal[] {
  const signals: RiskSignal[] = [];

  // Missing certification
  if (!supplier.certifications.value || supplier.certifications.value.length === 0) {
    signals.push({
      id: nanoid(8), type: 'missing-certification', severity: 'medium',
      title: 'No Certifications Found',
      description: 'No industry certifications were found in available sources.',
      recommendation: 'Request certification documentation directly from supplier.',
    });
  }

  // Unverified identity
  if (supplier.identityConfidence < 60) {
    signals.push({
      id: nanoid(8), type: 'identity-ambiguity', severity: 'medium',
      title: 'Supplier Identity Uncertain',
      description: `Identity confidence is ${supplier.identityConfidence}%. Limited independent verification available.`,
      recommendation: 'Verify company registration and contact details independently.',
    });
  }

  // Low data confidence
  if (supplier.dataConfidence < 50) {
    signals.push({
      id: nanoid(8), type: 'low-confidence', severity: 'medium',
      title: 'Limited Data Available',
      description: `Only ${supplier.dataConfidence}% of standard supplier fields could be populated from available sources.`,
      recommendation: 'Request additional information directly or broaden source search.',
    });
  }

  // No independent evidence (single source)
  if (supplier.sourceCount <= 1) {
    signals.push({
      id: nanoid(8), type: 'no-independent-evidence', severity: 'low',
      title: 'Single Source Only',
      description: 'All supplier information comes from a single source. No independent corroboration.',
      recommendation: 'Look for additional independent sources to verify claims.',
    });
  }

  // Price anomaly
  if (marketRange && supplier.listings.length > 0) {
    for (const listing of supplier.listings) {
      if (listing.price.value && listing.price.value > 0) {
        const deviation = ((listing.price.value - marketRange.median) / marketRange.median) * 100;
        if (deviation < -30) {
          signals.push({
            id: nanoid(8), type: 'price-anomaly', severity: 'high',
            title: 'Price Significantly Below Market',
            description: `Listed price is ${Math.abs(Math.round(deviation))}% below the observed market median. This may indicate quality differences, errors, or other concerns.`,
            recommendation: 'Verify product specifications and terms match requirements before proceeding.',
          });
        }
        if (deviation > 50) {
          signals.push({
            id: nanoid(8), type: 'price-anomaly', severity: 'low',
            title: 'Price Above Market Range',
            description: `Listed price is ${Math.round(deviation)}% above the observed market median.`,
            recommendation: 'Consider negotiation or alternative suppliers.',
          });
        }
      }
    }
  }

  // Delivery unclear
  if (!supplier.listings.some(l => l.specifications.some(s => s.name.toLowerCase().includes('delivery') || s.name.toLowerCase().includes('lead time')))) {
    signals.push({
      id: nanoid(8), type: 'delivery-unclear', severity: 'low',
      title: 'Delivery Timeline Not Verified',
      description: 'No delivery information found in available sources.',
      recommendation: 'Request delivery timeline and logistics details directly.',
    });
  }

  // Stale data
  const ageMs = Date.now() - new Date(supplier.lastRetrieved).getTime();
  if (ageMs > 24 * 60 * 60 * 1000) {
    signals.push({
      id: nanoid(8), type: 'stale-data', severity: 'low',
      title: 'Stale Data',
      description: 'Supplier data was retrieved more than 24 hours ago.',
      recommendation: 'Refresh live data for current information.',
    });
  }

  return signals;
}
