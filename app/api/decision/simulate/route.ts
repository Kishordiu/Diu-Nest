import { NextResponse } from 'next/server';
import { runWhatIf, modelDelayScenario, modelPriceIncreaseScenario } from '@/lib/server/simulation-engine';
import { DEFAULT_POLICY } from '@/lib/server/decision-engine';
import type { DiscoveredSupplier, DecisionPolicy, ProcurementRequirement, DecisionScore } from '@/lib/types';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { type, changes, suppliers, policy, requirement, baselineScores, supplierId, delayDays, increasePercent } = body as {
      type: 'what-if' | 'delay' | 'price-increase';
      changes?: Record<string, string | number>;
      suppliers: DiscoveredSupplier[];
      policy?: DecisionPolicy;
      requirement: ProcurementRequirement;
      baselineScores?: DecisionScore[];
      supplierId?: string;
      delayDays?: number;
      increasePercent?: number;
    };

    if (type === 'what-if' && changes && baselineScores) {
      const scenario = runWhatIf(changes, suppliers, policy || DEFAULT_POLICY, requirement, baselineScores);
      return NextResponse.json({ scenario });
    }

    if (type === 'delay' && supplierId && delayDays) {
      const supplier = suppliers.find(s => s.id === supplierId);
      if (!supplier) return NextResponse.json({ error: 'Supplier not found' }, { status: 404 });
      const scenario = modelDelayScenario(supplier, delayDays, requirement);
      return NextResponse.json({ scenario });
    }

    if (type === 'price-increase' && supplierId && increasePercent) {
      const supplier = suppliers.find(s => s.id === supplierId);
      if (!supplier) return NextResponse.json({ error: 'Supplier not found' }, { status: 404 });
      const scenario = modelPriceIncreaseScenario(supplier, increasePercent, requirement);
      return NextResponse.json({ scenario });
    }

    return NextResponse.json({ error: 'Invalid simulation type or missing params' }, { status: 400 });
  } catch (err) {
    return NextResponse.json({ error: 'Simulation failed' }, { status: 500 });
  }
}
