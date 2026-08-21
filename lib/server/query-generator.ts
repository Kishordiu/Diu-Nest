// Query Generator — creates diverse search queries from a parsed requirement
// Generates 5-8 queries with location/industry/category awareness

import type { ProcurementRequirement } from '../types';

export interface GeneratedQuery {
  query: string;
  purpose: string; // Why this query was generated
  priority: number; // 1 = highest
}

export function generateSearchQueries(req: ProcurementRequirement): GeneratedQuery[] {
  const queries: GeneratedQuery[] = [];
  const category = req.category.value || '';
  const product = req.product.value || category;
  const location = req.location.value?.replace(', India', '') || '';
  const country = req.location.value?.includes('India') ? 'India' : '';

  if (!category && !product) return [];

  // 1. Primary: product + supplier + country
  queries.push({
    query: `${product} supplier ${country || 'India'}`.trim(),
    purpose: 'Primary supplier search',
    priority: 1,
  });

  // 2. Product + manufacturer + country
  queries.push({
    query: `${product} manufacturer ${country || 'India'}`.trim(),
    purpose: 'Find manufacturers',
    priority: 1,
  });

  // 3. Location-specific
  if (location) {
    queries.push({
      query: `${product} supplier ${location}`,
      purpose: `Location-specific search (${location})`,
      priority: 2,
    });
  }

  // 4. Category + distributor
  queries.push({
    query: `${category} distributor ${country || ''}`.trim(),
    purpose: 'Find distributors',
    priority: 2,
  });

  // 5. Product + price + buy
  queries.push({
    query: `buy ${product} price ${country || ''}`.trim(),
    purpose: 'Find pricing information',
    priority: 3,
  });

  // 6. Product specifications
  if (req.specifications && req.specifications.length > 0) {
    const specQuery = req.specifications.map(s => s.value).join(' ');
    queries.push({
      query: `${product} ${specQuery} specifications`,
      purpose: 'Find technical specifications',
      priority: 3,
    });
  }

  // 7. Industry-specific
  if (req.industry?.value) {
    queries.push({
      query: `${req.industry.value} ${product} supplier certified`,
      purpose: `Industry-specific search (${req.industry.value})`,
      priority: 2,
    });
  }

  // 8. Certification-specific
  if (req.certifications?.value) {
    queries.push({
      query: `${product} ${req.certifications.value} certified manufacturer`,
      purpose: 'Find certified manufacturers',
      priority: 2,
    });
  }

  // Sort by priority and limit to 8
  return queries.sort((a, b) => a.priority - b.priority).slice(0, 8);
}
