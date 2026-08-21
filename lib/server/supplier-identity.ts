// Supplier Identity Resolution — deduplicates and merges supplier entities
import type { DiscoveredSupplier } from '../types';
import { extractDomain } from './provenance';

// Normalize a company name for comparison
function normalizeName(name: string): string {
  return name
    .toLowerCase()
    .replace(/\b(pvt|private|ltd|limited|llp|inc|llc|co|company|corp|corporation)\b\.?/g, '')
    .replace(/[^a-z0-9\s]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

// Calculate similarity between two strings (Jaccard on word sets)
function wordSimilarity(a: string, b: string): number {
  const wordsA = new Set(normalizeName(a).split(' ').filter(w => w.length > 2));
  const wordsB = new Set(normalizeName(b).split(' ').filter(w => w.length > 2));
  if (wordsA.size === 0 || wordsB.size === 0) return 0;
  const intersection = new Set(Array.from(wordsA).filter(w => wordsB.has(w)));
  const union = new Set([...Array.from(wordsA), ...Array.from(wordsB)]);
  return intersection.size / union.size;
}

// Check if two suppliers are likely the same entity
function areSameEntity(a: DiscoveredSupplier, b: DiscoveredSupplier): { match: boolean; confidence: number } {
  let score = 0;
  let checks = 0;

  // Domain match (strong signal)
  if (a.website.value && b.website.value) {
    const domA = extractDomain(a.website.value);
    const domB = extractDomain(b.website.value);
    checks++;
    if (domA === domB) score += 40;
  }

  // Name similarity
  if (a.name.value && b.name.value) {
    const sim = wordSimilarity(a.name.value, b.name.value);
    checks++;
    if (sim > 0.7) score += 30;
    else if (sim > 0.5) score += 15;
  }

  // Location match
  if (a.location.value && b.location.value) {
    checks++;
    if (a.location.value.toLowerCase() === b.location.value.toLowerCase()) score += 15;
  }

  // Product overlap
  if (a.products.value && b.products.value) {
    const prodsA = new Set(a.products.value.map(p => p.toLowerCase()));
    const prodsB = new Set(b.products.value.map(p => p.toLowerCase()));
    const overlap = Array.from(prodsA).filter(p => prodsB.has(p)).length;
    checks++;
    if (overlap > 0) score += 15;
  }

  const confidence = checks > 0 ? Math.min(score, 100) : 0;
  return { match: confidence >= 50, confidence };
}

// Merge two suppliers, keeping the best data
function mergeSuppliers(primary: DiscoveredSupplier, secondary: DiscoveredSupplier): DiscoveredSupplier {
  const merged = { ...primary };

  // Prefer higher confidence fields
  const fields: (keyof DiscoveredSupplier)[] = ['name', 'website', 'location', 'country', 'supplierType', 'products', 'certifications', 'contactInfo'];
  for (const field of fields) {
    const p = primary[field] as any;
    const s = secondary[field] as any;
    if (p && s && s.confidence > p.confidence) {
      (merged as any)[field] = s;
    }
    // Merge null fields
    if ((!p || p.value === null) && s && s.value !== null) {
      (merged as any)[field] = s;
    }
  }

  // Merge sources
  merged.sources = [...primary.sources, ...secondary.sources];
  merged.sourceCount = merged.sources.length;

  // Merge listings
  merged.listings = [...primary.listings, ...secondary.listings];

  // Recalculate confidence
  const allFields = [merged.name, merged.website, merged.location, merged.country, merged.supplierType, merged.products, merged.certifications, merged.contactInfo] as any[];
  const available = allFields.filter((f: any) => f?.value !== null).length;
  merged.dataConfidence = Math.round((available / allFields.length) * 100);

  return merged;
}

export function resolveSupplierIdentity(suppliers: DiscoveredSupplier[]): DiscoveredSupplier[] {
  if (suppliers.length <= 1) return suppliers;

  const resolved: DiscoveredSupplier[] = [];
  const merged = new Set<number>();

  for (let i = 0; i < suppliers.length; i++) {
    if (merged.has(i)) continue;

    let current = suppliers[i];
    for (let j = i + 1; j < suppliers.length; j++) {
      if (merged.has(j)) continue;

      const { match, confidence } = areSameEntity(current, suppliers[j]);
      if (match) {
        current = mergeSuppliers(current, suppliers[j]);
        current.identityConfidence = confidence;
        merged.add(j);
      }
    }

    if (!current.identityConfidence) {
      current.identityConfidence = 60; // Single-source identity
    }

    resolved.push(current);
  }

  // Sort by data confidence descending
  return resolved.sort((a, b) => b.dataConfidence - a.dataConfidence);
}
