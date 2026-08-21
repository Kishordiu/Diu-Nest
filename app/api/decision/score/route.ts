import { NextResponse } from 'next/server';
import { scoreSuppliers, DEFAULT_POLICY } from '@/lib/server/decision-engine';
import type { DiscoveredSupplier, DecisionPolicy, ProcurementRequirement, MarketPriceRange } from '@/lib/types';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { suppliers, policy, requirement, marketRange } = body as {
      suppliers: DiscoveredSupplier[];
      policy?: DecisionPolicy;
      requirement: ProcurementRequirement;
      marketRange?: MarketPriceRange;
    };

    if (!suppliers || !requirement) {
      return NextResponse.json({ error: 'suppliers and requirement are required' }, { status: 400 });
    }

    const scores = scoreSuppliers(suppliers, policy || DEFAULT_POLICY, requirement, marketRange);
    const sorted = scores.sort((a, b) => b.totalScore - a.totalScore);

    return NextResponse.json({
      scores: sorted,
      policy: policy || DEFAULT_POLICY,
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    return NextResponse.json({ error: 'Scoring failed' }, { status: 500 });
  }
}
