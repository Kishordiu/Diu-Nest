import { NextResponse } from 'next/server';
import { DiscoverRequestSchema } from '@/lib/schemas';
import { compileIntent } from '@/lib/server/intent-compiler';
import { discoverSuppliers } from '@/lib/server/supplier-discovery';
import { calculateMarketRange } from '@/lib/server/market-intelligence';
import { analyzeRisks } from '@/lib/server/risk-engine';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = DiscoverRequestSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid input', details: parsed.error.issues }, { status: 400 });
    }

    // Compile intent if not pre-parsed
    const requirement = compileIntent(parsed.data.requirementText);

    // Discover suppliers from the web
    const { suppliers, activities } = await discoverSuppliers(requirement, parsed.data.forceRefresh);

    // Calculate market range
    const marketRange = calculateMarketRange(suppliers);

    // Analyze risks for each supplier
    for (const sup of suppliers) {
      sup.riskSignals = analyzeRisks(sup, marketRange);
    }

    return NextResponse.json({
      suppliers,
      activities,
      marketRange,
      requirement,
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Discovery failed';
    if (message.includes('TAVILY_API_KEY')) {
      return NextResponse.json({
        error: 'LIVE_INTELLIGENCE_OFFLINE',
        message: 'Connect a web intelligence API to enable live supplier discovery. Set TAVILY_API_KEY in your environment.',
        suppliers: [],
        activities: [],
      }, { status: 503 });
    }
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
