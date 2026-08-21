// Simulation Engine — what-if recalculation + digital twin scenarios
import { nanoid } from 'nanoid';
import type { SimulationScenario, DiscoveredSupplier, DecisionPolicy, ProcurementRequirement, DecisionScore } from '../types';
import { scoreSuppliers } from './decision-engine';

export function runWhatIf(
  changes: Record<string, string | number>,
  suppliers: DiscoveredSupplier[],
  policy: DecisionPolicy,
  requirement: ProcurementRequirement,
  baselineScores: DecisionScore[],
): SimulationScenario {
  // Apply changes to a cloned requirement
  const modifiedReq = JSON.parse(JSON.stringify(requirement)) as ProcurementRequirement;

  for (const [key, val] of Object.entries(changes)) {
    const constraint = modifiedReq.allConstraints.find(c => c.field.toLowerCase() === key.toLowerCase());
    if (constraint) {
      constraint.value = String(val);
    }
    // Also update top-level fields
    if (key.toLowerCase() === 'deadline' && modifiedReq.deadline) {
      modifiedReq.deadline.value = `${val} days`;
    }
    if (key.toLowerCase() === 'budget' && modifiedReq.budget) {
      modifiedReq.budget.value = `₹${Number(val).toLocaleString('en-IN')}`;
    }
  }

  const simulated = scoreSuppliers(suppliers, policy, modifiedReq);

  // Calculate deltas
  const delta = simulated.map(sim => {
    const base = baselineScores.find(b => b.supplierId === sim.supplierId);
    const baseRank = baselineScores.sort((a, b) => b.totalScore - a.totalScore).findIndex(b => b.supplierId === sim.supplierId) + 1;
    const simRank = simulated.sort((a, b) => b.totalScore - a.totalScore).findIndex(s => s.supplierId === sim.supplierId) + 1;
    return {
      supplierId: sim.supplierId,
      scoreDelta: sim.totalScore - (base?.totalScore || 0),
      rankChange: baseRank - simRank,
    };
  });

  return {
    id: nanoid(8),
    name: Object.entries(changes).map(([k, v]) => `${k}: ${v}`).join(', '),
    changes,
    baseline: baselineScores,
    simulated,
    delta,
    label: 'simulation',
  };
}

// Digital Twin — model specific scenarios
export interface TwinScenario {
  id: string;
  name: string;
  description: string;
  impact: string;
  baseline: { metric: string; value: string }[];
  scenario: { metric: string; value: string }[];
  mitigation: string;
  label: 'simulation';
}

export function modelDelayScenario(
  supplier: DiscoveredSupplier,
  delayDays: number,
  requirement: ProcurementRequirement,
): TwinScenario {
  const deadlineStr = requirement.deadline?.value || '';
  const deadlineDays = parseInt(deadlineStr) || 10;
  const newDelivery = deadlineDays + delayDays;
  const overdue = newDelivery > deadlineDays;

  return {
    id: nanoid(8),
    name: `${delayDays}-Day Delivery Delay`,
    description: `Simulating a ${delayDays}-day delay from ${supplier.name.value || 'supplier'}.`,
    impact: overdue
      ? `Delivery would exceed deadline by ${delayDays} days (${newDelivery} vs ${deadlineDays} required).`
      : `Delivery would still meet the ${deadlineDays}-day requirement.`,
    baseline: [
      { metric: 'Required Delivery', value: `${deadlineDays} days` },
      { metric: 'Supplier', value: supplier.name.value || 'Unknown' },
    ],
    scenario: [
      { metric: 'Simulated Delivery', value: `${newDelivery} days` },
      { metric: 'Overdue', value: overdue ? `${delayDays} days late` : 'On time' },
      { metric: 'Impact', value: overdue ? 'HIGH — exceeds deadline' : 'LOW — within tolerance' },
    ],
    mitigation: overdue
      ? 'Consider split procurement across multiple suppliers or negotiate expedited shipping terms.'
      : 'Buffer exists within timeline. Monitor delivery status proactively.',
    label: 'simulation',
  };
}

export function modelPriceIncreaseScenario(
  supplier: DiscoveredSupplier,
  increasePercent: number,
  requirement: ProcurementRequirement,
): TwinScenario {
  const currentPrice = supplier.listings[0]?.price?.value || 0;
  const newPrice = Math.round(currentPrice * (1 + increasePercent / 100));
  const budgetStr = requirement.budget?.value?.replace(/[₹$,\s]/g, '') || '0';
  const budget = parseFloat(budgetStr) || 0;
  const exceedsBudget = newPrice > budget && budget > 0;

  return {
    id: nanoid(8),
    name: `${increasePercent}% Price Increase`,
    description: `Simulating a ${increasePercent}% price increase from ${supplier.name.value || 'supplier'}.`,
    impact: exceedsBudget
      ? `New price ₹${newPrice.toLocaleString('en-IN')} would exceed budget by ₹${(newPrice - budget).toLocaleString('en-IN')}.`
      : currentPrice > 0 ? `New price ₹${newPrice.toLocaleString('en-IN')} remains within budget.` : 'Cannot assess — no current price data.',
    baseline: [
      { metric: 'Current Price', value: currentPrice > 0 ? `₹${currentPrice.toLocaleString('en-IN')}` : 'Not available' },
      { metric: 'Budget', value: budget > 0 ? `₹${budget.toLocaleString('en-IN')}` : 'Not specified' },
    ],
    scenario: [
      { metric: 'Simulated Price', value: currentPrice > 0 ? `₹${newPrice.toLocaleString('en-IN')}` : 'Not available' },
      { metric: 'Budget Impact', value: exceedsBudget ? 'EXCEEDS BUDGET' : 'Within budget' },
    ],
    mitigation: exceedsBudget
      ? 'Negotiate price lock with PO. Consider alternative suppliers or quantity adjustment.'
      : 'Price remains viable. Consider locking in current quote before escalation.',
    label: 'simulation',
  };
}
