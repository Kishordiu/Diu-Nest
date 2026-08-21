// Firewall Engine — inspects actual data, never fabricates results
import { nanoid } from 'nanoid';
import type { FirewallCheck, DiscoveredSupplier, ProcurementRequirement, DecisionScore, MarketPriceRange } from '../types';

export function runFirewallChecks(
  supplier: DiscoveredSupplier,
  requirement: ProcurementRequirement,
  score: DecisionScore,
  marketRange?: MarketPriceRange | null,
): FirewallCheck[] {
  const checks: FirewallCheck[] = [];

  // 1. Budget check
  const budgetStr = requirement.budget?.value?.replace(/[₹$,\s]/g, '') || '';
  const budget = parseFloat(budgetStr);
  const price = supplier.listings[0]?.price?.value;
  if (budget && price) {
    checks.push({
      id: nanoid(8), label: 'BUDGET CHECK',
      detail: price <= budget
        ? `₹${price.toLocaleString('en-IN')} is within the ₹${budget.toLocaleString('en-IN')} budget.`
        : `₹${price.toLocaleString('en-IN')} EXCEEDS the ₹${budget.toLocaleString('en-IN')} budget by ₹${(price - budget).toLocaleString('en-IN')}.`,
      status: price <= budget ? 'pass' : 'block',
      label_type: 'calculated',
    });
  } else {
    checks.push({
      id: nanoid(8), label: 'BUDGET CHECK',
      detail: !budget ? 'Budget not specified in requirement.' : 'No price data available for comparison.',
      status: 'review',
      label_type: 'calculated',
    });
  }

  // 2. Supplier identity verification
  checks.push({
    id: nanoid(8), label: 'SUPPLIER IDENTITY',
    detail: supplier.identityConfidence >= 70
      ? `${supplier.name.value}: Identity confidence ${supplier.identityConfidence}% based on ${supplier.sourceCount} source(s).`
      : `${supplier.name.value}: Identity confidence only ${supplier.identityConfidence}%. Additional verification recommended.`,
    status: supplier.identityConfidence >= 70 ? 'pass' : 'review',
    label_type: 'calculated',
  });

  // 3. Source quality
  const tier1Sources = supplier.sources.filter(s => s.sourceTier === 1).length;
  checks.push({
    id: nanoid(8), label: 'SOURCE QUALITY',
    detail: tier1Sources > 0
      ? `${tier1Sources} Tier 1 source(s) (official/manufacturer). ${supplier.sourceCount} total sources.`
      : `No Tier 1 sources. All data from Tier ${supplier.sources[0]?.sourceTier || '?'} sources.`,
    status: tier1Sources > 0 ? 'pass' : 'review',
    label_type: 'calculated',
  });

  // 4. Certification evidence
  const certs = supplier.certifications.value;
  if (certs && certs.length > 0) {
    checks.push({
      id: nanoid(8), label: 'CERTIFICATIONS',
      detail: `Found: ${certs.join(', ')}. Verification status: ${supplier.certifications.status}.`,
      status: supplier.certifications.status === 'verified' ? 'pass' : 'review',
      label_type: 'live-web',
    });
  } else {
    checks.push({
      id: nanoid(8), label: 'CERTIFICATIONS',
      detail: 'No certifications found in available sources.',
      status: 'review',
      label_type: 'calculated',
    });
  }

  // 5. Requirement fit
  const hardFails = score.requirementFit.filter(r => r.status === 'fail' && r.constraintType === 'hard');
  checks.push({
    id: nanoid(8), label: 'REQUIREMENT FIT',
    detail: hardFails.length === 0
      ? `No hard requirement violations detected. ${score.requirementFit.filter(r => r.status === 'unknown').length} requirement(s) could not be verified.`
      : `${hardFails.length} hard requirement(s) FAILED: ${hardFails.map(f => f.requirement).join(', ')}.`,
    status: hardFails.length === 0 ? 'pass' : 'block',
    label_type: 'calculated',
  });

  // 6. Price anomaly
  if (marketRange && price) {
    const deviation = ((price - marketRange.median) / marketRange.median) * 100;
    if (Math.abs(deviation) > 30) {
      checks.push({
        id: nanoid(8), label: 'PRICE ANOMALY',
        detail: `Price is ${Math.round(Math.abs(deviation))}% ${deviation < 0 ? 'below' : 'above'} the observed market median (₹${marketRange.median.toLocaleString('en-IN')}). Requires verification.`,
        status: 'review',
        label_type: 'calculated',
      });
    } else {
      checks.push({
        id: nanoid(8), label: 'PRICE ANALYSIS',
        detail: `Price within expected market range. Median: ₹${marketRange.median.toLocaleString('en-IN')} (${marketRange.sourceCount} sources).`,
        status: 'pass',
        label_type: 'calculated',
      });
    }
  }

  // 7. Risk assessment
  const highRisks = supplier.riskSignals.filter(r => r.severity === 'high');
  checks.push({
    id: nanoid(8), label: 'RISK ASSESSMENT',
    detail: highRisks.length === 0
      ? `${supplier.riskSignals.length} risk signal(s) detected, none high severity.`
      : `${highRisks.length} HIGH severity risk signal(s): ${highRisks.map(r => r.title).join('; ')}.`,
    status: highRisks.length === 0 ? 'pass' : 'review',
    label_type: 'calculated',
  });

  // 8. Data freshness
  const ageMs = Date.now() - new Date(supplier.lastRetrieved).getTime();
  const ageHours = Math.round(ageMs / 3600000);
  checks.push({
    id: nanoid(8), label: 'DATA FRESHNESS',
    detail: ageHours < 1
      ? `Data retrieved ${Math.round(ageMs / 60000)} minutes ago. Current.`
      : `Data is ${ageHours} hour(s) old.${ageHours > 24 ? ' Consider refreshing.' : ''}`,
    status: ageHours <= 24 ? 'pass' : 'review',
    label_type: 'calculated',
  });

  return checks;
}
