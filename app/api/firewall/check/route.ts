import { NextResponse } from 'next/server';
import { runFirewallChecks } from '@/lib/server/firewall-engine';
import type { DiscoveredSupplier, ProcurementRequirement, DecisionScore, MarketPriceRange } from '@/lib/types';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { supplier, requirement, score, marketRange } = body as {
      supplier: DiscoveredSupplier;
      requirement: ProcurementRequirement;
      score: DecisionScore;
      marketRange?: MarketPriceRange;
    };

    if (!supplier || !requirement || !score) {
      return NextResponse.json({ error: 'supplier, requirement, and score are required' }, { status: 400 });
    }

    const checks = runFirewallChecks(supplier, requirement, score, marketRange);
    return NextResponse.json({ checks, timestamp: new Date().toISOString() });
  } catch (err) {
    return NextResponse.json({ error: 'Firewall check failed' }, { status: 500 });
  }
}
