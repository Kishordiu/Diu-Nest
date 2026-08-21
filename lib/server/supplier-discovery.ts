// Supplier Discovery — orchestrates search → extract → deduplicate → rank
import { nanoid } from 'nanoid';
import { getSearchProvider } from './web-search';
import { extractSupplierFields } from './web-extract';
import { createSourceRecord } from './provenance';
import { generateSearchQueries } from './query-generator';
import { resolveSupplierIdentity } from './supplier-identity';
import type { ProcurementRequirement, DiscoveredSupplier, SearchActivity, SourcedField, MarketListing } from '../types';
import type { SearchResult } from './web-search';

function makeSourcedField<T>(value: T | null, source: ReturnType<typeof createSourceRecord> | null, confidence: number): SourcedField<T> {
  return {
    value,
    source,
    confidence,
    status: value ? (source?.sourceTier === 1 ? 'verified' : source?.sourceTier === 2 ? 'supported' : 'self-declared') : 'not-available',
    label: source ? 'live-web' : 'not-available' as any,
    lastUpdated: new Date().toISOString(),
  };
}

export async function discoverSuppliers(
  requirement: ProcurementRequirement,
  forceRefresh = false
): Promise<{ suppliers: DiscoveredSupplier[]; activities: SearchActivity[] }> {
  const provider = getSearchProvider();

  if (!provider.isAvailable()) {
    return { suppliers: [], activities: [{
      id: nanoid(8),
      query: 'N/A',
      status: 'error',
      resultsFound: 0, usableSources: 0, suppliersIdentified: 0,
      manufacturersFound: 0, distributorsFound: 0, marketplaceListings: 0,
      timestamp: new Date().toISOString(), durationMs: 0,
      error: 'TAVILY_API_KEY not configured. Connect a web intelligence API to enable live supplier discovery.',
    }]};
  }

  const queries = generateSearchQueries(requirement);
  const allResults: SearchResult[] = [];
  const activities: SearchActivity[] = [];

  // Execute searches
  for (const gq of queries) {
    const start = Date.now();
    const activity: SearchActivity = {
      id: nanoid(8), query: gq.query, status: 'searching',
      resultsFound: 0, usableSources: 0, suppliersIdentified: 0,
      manufacturersFound: 0, distributorsFound: 0, marketplaceListings: 0,
      timestamp: new Date().toISOString(), durationMs: 0,
    };

    try {
      const results = await provider.search(gq.query, { maxResults: 10, searchDepth: 'basic' });
      activity.resultsFound = results.length;
      activity.status = 'complete';
      activity.durationMs = Date.now() - start;
      allResults.push(...results);
    } catch (err) {
      activity.status = 'error';
      activity.error = err instanceof Error ? err.message : 'Search failed';
      activity.durationMs = Date.now() - start;
    }
    activities.push(activity);
  }

  // Deduplicate by URL
  const uniqueResults = new Map<string, SearchResult>();
  for (const r of allResults) {
    const domain = new URL(r.url).hostname;
    const key = `${domain}:${r.title?.slice(0, 50)}`;
    if (!uniqueResults.has(key)) uniqueResults.set(key, r);
  }

  // Extract supplier data from each result
  const rawSuppliers: DiscoveredSupplier[] = [];
  for (const result of Array.from(uniqueResults.values())) {
    const source = createSourceRecord({
      url: result.url, title: result.title,
      snippet: result.content?.slice(0, 400), publishedDate: result.publishedDate,
    });
    const text = result.rawContent || result.content || '';
    const extracted = extractSupplierFields(text, result.url, result.title);

    if (!extracted.companyName) continue;

    const supplier: DiscoveredSupplier = {
      id: nanoid(10),
      name: makeSourcedField(extracted.companyName, source, 75),
      website: makeSourcedField(extracted.website || result.url, source, 90),
      location: makeSourcedField(extracted.location, source, extracted.location ? 70 : 0),
      country: makeSourcedField(extracted.country, source, extracted.country ? 80 : 0),
      supplierType: makeSourcedField(extracted.supplierType, source, 60),
      products: makeSourcedField(extracted.products, source, extracted.products ? 65 : 0),
      certifications: makeSourcedField(extracted.certifications, source, extracted.certifications ? 70 : 0),
      contactInfo: makeSourcedField(extracted.contactInfo, source, extracted.contactInfo ? 80 : 0),
      dataConfidence: 0, // calculated below
      sourceCount: 1,
      sources: [source],
      identityConfidence: 0,
      listings: [],
      riskSignals: [],
      lastRetrieved: new Date().toISOString(),
      freshnessStatus: 'live',
    };

    // Create market listings from extracted prices
    if (extracted.prices) {
      for (const p of extracted.prices) {
        const listing: MarketListing = {
          id: nanoid(8),
          productName: makeSourcedField(p.productName, source, 60),
          manufacturer: makeSourcedField(extracted.companyName, source, 50),
          model: makeSourcedField('', null, 0),
          price: makeSourcedField(p.price, source, p.price ? 75 : 0),
          currency: makeSourcedField(p.currency, source, 90),
          priceType: p.priceType,
          availability: makeSourcedField('', null, 0),
          moq: makeSourcedField(p.moq, source, p.moq ? 70 : 0),
          specifications: (extracted.specifications || []).map(s => ({ name: s.name, value: s.value, unit: s.unit, source })),
          source,
          label: 'live-web',
        };
        supplier.listings.push(listing);
      }
    }

    // Calculate data confidence
    const fields = [supplier.name, supplier.website, supplier.location, supplier.country, supplier.supplierType, supplier.products, supplier.certifications, supplier.contactInfo];
    const available = fields.filter(f => f.value !== null).length;
    supplier.dataConfidence = Math.round((available / fields.length) * 100);

    rawSuppliers.push(supplier);
  }

  // Resolve identities (merge duplicates)
  const resolved = resolveSupplierIdentity(rawSuppliers);

  // Update activity counts
  const totals = activities.reduce((acc, a) => {
    acc.usable += a.resultsFound;
    return acc;
  }, { usable: 0 });

  for (const a of activities) {
    a.usableSources = uniqueResults.size;
    a.suppliersIdentified = resolved.length;
    a.manufacturersFound = resolved.filter(s => s.supplierType.value === 'manufacturer').length;
    a.distributorsFound = resolved.filter(s => s.supplierType.value === 'distributor').length;
    a.marketplaceListings = resolved.filter(s => s.supplierType.value === 'marketplace').length;
  }

  return { suppliers: resolved, activities };
}
