// Decision Engine — configurable weighted scoring with full transparency
// AI does NOT decide. Deterministic engine calculates, AI explains.
import { nanoid } from 'nanoid';
import type { DecisionPolicy, DecisionScore, DiscoveredSupplier, ProcurementRequirement, RequirementFitResult, MarketPriceRange } from '../types';

export const DEFAULT_POLICY: DecisionPolicy = {
  cost: 30,
  delivery: 25,
  quality: 20,
  reliability: 15,
  risk: 10,
};

export function scoreSuppliers(
  suppliers: DiscoveredSupplier[],
  policy: DecisionPolicy,
  requirement: ProcurementRequirement,
  marketRange?: MarketPriceRange | null,
): DecisionScore[] {
  return suppliers.map(sup => scoreOne(sup, policy, requirement, marketRange));
}

function scoreOne(
  supplier: DiscoveredSupplier,
  policy: DecisionPolicy,
  requirement: ProcurementRequirement,
  marketRange?: MarketPriceRange | null,
): DecisionScore {
  const breakdown: DecisionScore['breakdown'] = [];

  // --- COST (lower is better) ---
  const costScore = scoreCost(supplier, marketRange);
  breakdown.push({
    category: 'cost',
    weight: policy.cost,
    score: costScore.score,
    weightedScore: Math.round(costScore.score * policy.cost / 100),
    reasoning: costScore.reasoning,
    evidenceCount: costScore.evidenceCount,
    dataAvailable: costScore.dataAvailable,
  });

  // --- DELIVERY ---
  const deliveryScore = scoreDelivery(supplier, requirement);
  breakdown.push({
    category: 'delivery',
    weight: policy.delivery,
    score: deliveryScore.score,
    weightedScore: Math.round(deliveryScore.score * policy.delivery / 100),
    reasoning: deliveryScore.reasoning,
    evidenceCount: deliveryScore.evidenceCount,
    dataAvailable: deliveryScore.dataAvailable,
  });

  // --- QUALITY ---
  const qualityScore = scoreQuality(supplier);
  breakdown.push({
    category: 'quality',
    weight: policy.quality,
    score: qualityScore.score,
    weightedScore: Math.round(qualityScore.score * policy.quality / 100),
    reasoning: qualityScore.reasoning,
    evidenceCount: qualityScore.evidenceCount,
    dataAvailable: qualityScore.dataAvailable,
  });

  // --- RELIABILITY ---
  const reliabilityScore = scoreReliability(supplier);
  breakdown.push({
    category: 'reliability',
    weight: policy.reliability,
    score: reliabilityScore.score,
    weightedScore: Math.round(reliabilityScore.score * policy.reliability / 100),
    reasoning: reliabilityScore.reasoning,
    evidenceCount: reliabilityScore.evidenceCount,
    dataAvailable: reliabilityScore.dataAvailable,
  });

  // --- RISK (lower risk = higher score) ---
  const riskScore = scoreRisk(supplier);
  breakdown.push({
    category: 'risk',
    weight: policy.risk,
    score: riskScore.score,
    weightedScore: Math.round(riskScore.score * policy.risk / 100),
    reasoning: riskScore.reasoning,
    evidenceCount: riskScore.evidenceCount,
    dataAvailable: riskScore.dataAvailable,
  });

  const totalScore = breakdown.reduce((sum, b) => sum + b.weightedScore, 0);
  const dataCategories = breakdown.filter(b => b.dataAvailable).length;

  // Requirement fit
  const requirementFit = checkRequirementFit(supplier, requirement);

  // Determine recommendation
  const hasHardFail = requirementFit.some(r => r.status === 'fail' && r.constraintType === 'hard');
  const confidenceLevel = dataCategories >= 4 ? 'high' : dataCategories >= 2 ? 'medium' : dataCategories >= 1 ? 'low' : 'insufficient';

  let recommendation: DecisionScore['recommendation'] = 'insufficient-data';
  if (confidenceLevel === 'insufficient') {
    recommendation = 'insufficient-data';
  } else if (hasHardFail) {
    recommendation = 'not-recommended';
  } else if (totalScore >= 60 && confidenceLevel !== 'low') {
    recommendation = 'recommended';
  } else if (totalScore >= 30) {
    recommendation = 'acceptable';
  } else {
    recommendation = 'not-recommended';
  }

  return {
    supplierId: supplier.id,
    supplierName: supplier.name.value || 'Unknown',
    totalScore,
    breakdown,
    requirementFit,
    recommendation,
    confidenceLevel,
  };
}

function scoreCost(supplier: DiscoveredSupplier, marketRange?: MarketPriceRange | null) {
  const prices = supplier.listings.filter(l => l.price.value && l.price.value > 0);
  if (prices.length === 0) {
    return { score: 50, reasoning: 'No price data available. Cannot assess cost competitiveness.', evidenceCount: 0, dataAvailable: false };
  }

  const price = prices[0].price.value!;
  if (!marketRange || marketRange.sourceCount < 2) {
    return { score: 50, reasoning: `Listed price: ₹${price.toLocaleString('en-IN')}. Insufficient market data for comparison.`, evidenceCount: 1, dataAvailable: true };
  }

  // Score based on position in market range (lower = better)
  const position = (price - marketRange.lowest) / (marketRange.highest - marketRange.lowest || 1);
  const score = Math.max(0, Math.min(100, Math.round((1 - position) * 80 + 10)));

  return {
    score,
    reasoning: `Listed at ₹${price.toLocaleString('en-IN')} against market range ₹${marketRange.lowest.toLocaleString('en-IN')}–₹${marketRange.highest.toLocaleString('en-IN')}.`,
    evidenceCount: 1,
    dataAvailable: true,
  };
}

function scoreDelivery(supplier: DiscoveredSupplier, requirement: ProcurementRequirement) {
  // No historical delivery data — we can only check if delivery info exists
  const hasDeliveryInfo = supplier.listings.some(l =>
    l.specifications.some(s => s.name.toLowerCase().includes('delivery') || s.name.toLowerCase().includes('lead'))
  );

  if (!hasDeliveryInfo) {
    return { score: 50, reasoning: 'Delivery timeline not verified from available sources.', evidenceCount: 0, dataAvailable: false };
  }

  return { score: 60, reasoning: 'Delivery information found but performance history unavailable.', evidenceCount: 1, dataAvailable: true };
}

function scoreQuality(supplier: DiscoveredSupplier) {
  const certs = supplier.certifications.value;
  if (!certs || certs.length === 0) {
    return { score: 30, reasoning: 'No certifications found in available sources.', evidenceCount: 0, dataAvailable: false };
  }

  const hasMedical = certs.some(c => /13485|CE|FDA/i.test(c));
  const hasBasic = certs.some(c => /9001/i.test(c));

  const score = hasMedical ? 85 : hasBasic ? 65 : 50;
  return {
    score,
    reasoning: `Certifications found: ${certs.join(', ')}. Status: ${supplier.certifications.status}.`,
    evidenceCount: certs.length,
    dataAvailable: true,
  };
}

function scoreReliability(supplier: DiscoveredSupplier) {
  // No organizational history — score based on data completeness and source quality
  const tierScores = supplier.sources.map(s => s.sourceTier === 1 ? 80 : s.sourceTier === 2 ? 60 : 40);
  const avgTier = tierScores.length > 0 ? tierScores.reduce((a, b) => a + b, 0) / tierScores.length : 30;

  return {
    score: Math.round(avgTier),
    reasoning: supplier.sourceCount > 1
      ? `Based on ${supplier.sourceCount} independent sources. No organizational transaction history.`
      : 'Single source only. No organizational transaction history available.',
    evidenceCount: supplier.sourceCount,
    dataAvailable: supplier.sourceCount > 0,
  };
}

function scoreRisk(supplier: DiscoveredSupplier) {
  const riskCount = supplier.riskSignals.length;
  const highRisks = supplier.riskSignals.filter(r => r.severity === 'high').length;
  const medRisks = supplier.riskSignals.filter(r => r.severity === 'medium').length;

  if (riskCount === 0) {
    return { score: 70, reasoning: 'No risk signals detected. Limited data may mean risks are undetected.', evidenceCount: 0, dataAvailable: true };
  }

  const penalty = highRisks * 25 + medRisks * 10;
  const score = Math.max(0, 80 - penalty);

  return {
    score,
    reasoning: `${riskCount} risk signal(s): ${highRisks} high, ${medRisks} medium severity.`,
    evidenceCount: riskCount,
    dataAvailable: true,
  };
}

function checkRequirementFit(supplier: DiscoveredSupplier, requirement: ProcurementRequirement): RequirementFitResult[] {
  const results: RequirementFitResult[] = [];

  // Budget fit
  if (requirement.budget.value) {
    const budgetStr = requirement.budget.value.replace(/[₹$,\s]/g, '');
    const budget = parseFloat(budgetStr);
    const price = supplier.listings[0]?.price?.value;
    if (price && budget) {
      results.push({
        requirement: 'Budget', required: requirement.budget.value,
        actual: `₹${price.toLocaleString('en-IN')}`,
        status: price <= budget ? 'pass' : 'fail',
        constraintType: requirement.budget.type,
      });
    } else {
      results.push({ requirement: 'Budget', required: requirement.budget.value, actual: null, status: 'unknown', constraintType: requirement.budget.type });
    }
  }

  // Location fit
  if (requirement.location.value) {
    const supLoc = supplier.location.value;
    results.push({
      requirement: 'Location', required: requirement.location.value,
      actual: supLoc,
      status: supLoc ? (supLoc.toLowerCase().includes(requirement.location.value.split(',')[0].toLowerCase()) ? 'pass' : 'partial') : 'unknown',
      constraintType: requirement.location.type,
    });
  }

  return results;
}
